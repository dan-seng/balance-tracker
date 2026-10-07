package com.hisabapp.backup

import android.content.Context
import android.content.ContentValues
import android.database.sqlite.SQLiteDatabase
import org.json.JSONArray
import org.json.JSONObject

internal object BackupStore {
    private fun iso(value: String): Long {
        val patterns = listOf("yyyy-MM-dd'T'HH:mm:ss.SSSXXX", "yyyy-MM-dd'T'HH:mm:ssXXX")
        for (pattern in patterns) {
            val format = java.text.SimpleDateFormat(pattern, java.util.Locale.US)
            format.isLenient = false
            val position = java.text.ParsePosition(0)
            val parsed = format.parse(value, position)
            if (parsed != null && position.index == value.length) return parsed.time
        }
        error("INVALID_FILE")
    }
    private fun nowIso(): String = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).apply {
        timeZone = java.util.TimeZone.getTimeZone("UTC")
    }.format(java.util.Date())
    private data class Table(val database: String, val name: String, val columns: List<String>)
    private val tables = listOf(
        Table("main", "accounts", listOf("id", "bank_id", "bank_name", "account_number", "current_balance", "currency", "last_updated", "source", "sub_id")),
        Table("main", "transactions", listOf("id", "account_id", "bank_id", "bank_name", "type", "amount", "balance_after", "date", "raw_sms", "hash", "currency", "sender")),
        Table("main", "user_settings", listOf("key", "value")),
        Table("shop", "products", listOf("id", "name", "unit", "quantity", "costCents", "priceCents", "lowStock")),
        Table("shop", "customers", listOf("id", "name", "phone")),
        Table("shop", "sales", listOf("id", "customerId", "date", "totalCents", "costCents")),
        Table("shop", "lines", listOf("id", "saleId", "productId", "name", "unit", "quantity", "priceCents", "costCents")),
        Table("shop", "payments", listOf("id", "saleId", "date", "amountCents", "kind")),
        Table("shop", "expenses", listOf("id", "date", "description", "category", "amountCents")),
        Table("shop", "movements", listOf("id", "productId", "date", "kind", "quantity", "amountCents")),
        Table("shop", "returns", listOf("id", "saleId", "lineId", "date", "quantity", "amountCents", "costCents", "refundCents", "restocked")),
        Table("shop", "adjustments", listOf("id", "productId", "date", "quantityDelta", "costCents", "reason")),
        Table("shop", "suppliers", listOf("id", "name", "phone")),
        Table("shop", "purchases", listOf("id", "supplierId", "productId", "date", "quantity", "costCents", "totalCents")),
        Table("shop", "supplierPayments", listOf("id", "purchaseId", "date", "amountCents")),
        Table("main", "transaction_notes", listOf("hash", "reason", "updated_at"))
    )
    private fun connect(context: Context): SQLiteDatabase {
        val bank = context.getDatabasePath("HisabApp.db")
        val shop = context.getDatabasePath("HisabShop.db")
        require(bank.exists() && shop.exists()) { "DATABASE" }
        val db = SQLiteDatabase.openDatabase(bank.path, null, SQLiteDatabase.OPEN_READWRITE)
        try {
            db.execSQL("ATTACH DATABASE ? AS shop", arrayOf(shop.path))
            // Reject schema mismatches instead of exporting/restoring incomplete data.
            for (table in tables) {
                val columns = mutableSetOf<String>()
                db.rawQuery("PRAGMA ${table.database}.table_info(${table.name})", null).use { cursor ->
                    while (cursor.moveToNext()) columns.add(cursor.getString(cursor.getColumnIndexOrThrow("name")))
                }
                require(columns == table.columns.toSet()) { "SCHEMA" }
            }
            return db
        } catch (error: Exception) { db.close(); throw error }
    }
    fun snapshot(context: Context): JSONObject = connect(context).use { db ->
        val data = JSONObject()
        db.beginTransaction()
        try {
            for (table in tables) {
                val rows = JSONArray()
                db.rawQuery("SELECT ${table.columns.joinToString(",")} FROM ${table.database}.${table.name}", null).use { cursor ->
                    while (cursor.moveToNext()) {
                        val row = JSONObject()
                        table.columns.forEachIndexed { index, column ->
                            val value: Any = when (cursor.getType(index)) {
                                android.database.Cursor.FIELD_TYPE_NULL -> JSONObject.NULL
                                android.database.Cursor.FIELD_TYPE_INTEGER -> cursor.getLong(index)
                                android.database.Cursor.FIELD_TYPE_FLOAT -> cursor.getDouble(index)
                                android.database.Cursor.FIELD_TYPE_STRING -> cursor.getString(index)
                                else -> error("SCHEMA")
                            }
                            row.put(column, value)
                        }
                        rows.put(row)
                    }
                }
                data.put(table.name, rows)
            }
            db.setTransactionSuccessful()
        } finally { db.endTransaction() }
        JSONObject().put("format", "hisab-backup").put("version", 3)
            .put("createdAt", nowIso()).put("data", data)
    }
    private val numberColumns = setOf("current_balance", "amount", "balance_after", "sub_id", "quantity", "costCents", "priceCents", "lowStock", "totalCents", "amountCents", "refundCents", "restocked", "quantityDelta")
    private val nullableColumns = setOf("sub_id", "balance_after", "customerId")
    fun validate(payload: JSONObject) {
        require(payload.optString("format") == "hisab-backup" && payload.optInt("version") in setOf(1, 2, 3)) { "INVALID_FILE" }
        iso(payload.getString("createdAt"))
        val data = payload.getJSONObject("data")
        val version = payload.optInt("version")
        if (version < 3) {
            val count = if (version == 1) 10 else 15
            require(data.keys().asSequence().toSet() == tables.take(count).map { it.name }.toSet()) { "INVALID_FILE" }
            for (table in tables.drop(count)) data.put(table.name, JSONArray())
            payload.put("version", 3)
        }
        require(data.keys().asSequence().toSet() == tables.map { it.name }.toSet()) { "INVALID_FILE" }
        var count = 0
        for (table in tables) {
            val ids = mutableSetOf<String>()
            val rows = data.getJSONArray(table.name)
            count += rows.length()
            require(count <= 200_000) { "TOO_LARGE" }
            for (i in 0 until rows.length()) {
                val row = rows.getJSONObject(i)
                require(row.keys().asSequence().toSet() == table.columns.toSet()) { "INVALID_FILE" }
                for (column in table.columns) {
                    val value = row.get(column)
                    if (value == JSONObject.NULL) require(column in nullableColumns) { "INVALID_FILE" }
                    else if (column in numberColumns) {
                        require(value is Number && value.toDouble().isFinite()) { "INVALID_FILE" }
                        if (column !in setOf("current_balance", "amount", "balance_after")) {
                            val number = (value as Number).toDouble()
                            if (column in setOf("quantity", "lowStock", "quantityDelta")) require(kotlin.math.abs(number) <= 1_000_000) { "INVALID_FILE" }
                            require(number == number.toLong().toDouble() && kotlin.math.abs(number) <= 100_000_000_000L) { "INVALID_FILE" }
                            if (column == "sub_id") require(number >= -1) { "INVALID_FILE" }
                            else if (column != "quantityDelta" && (column != "quantity" || table.name != "movements")) require(number >= 0) { "INVALID_FILE" }
                        }
                    } else require(value is String && value.length <= 1_000_000) { "INVALID_FILE" }
                }
                val primary = when (table.name) { "user_settings" -> "key"; "transaction_notes" -> "hash"; else -> "id" }
                require(row.getString(primary).isNotBlank() && ids.add(row.getString(primary))) { "INVALID_FILE" }
                if (table.name in setOf("accounts", "transactions")) require(row.getString("currency") == "ETB") { "INVALID_FILE" }
                if (table.name == "transactions") require(row.getString("type") in setOf("credit", "debit") && row.getDouble("amount") > 0) { "INVALID_FILE" }
                if (table.name == "payments") require(row.getString("kind") in setOf("sale", "repayment") && row.getLong("amountCents") > 0) { "INVALID_FILE" }
                if (table.name == "movements") require(row.getString("kind") in setOf("opening", "restock", "sale", "return", "adjustment")) { "INVALID_FILE" }
                if (table.name == "expenses") require(row.getLong("amountCents") > 0) { "INVALID_FILE" }
                val dateColumn = when (table.name) { "accounts" -> "last_updated"; "transactions", "sales", "lines", "payments", "expenses", "movements", "returns", "adjustments", "purchases", "supplierPayments" -> "date"; "transaction_notes" -> "updated_at"; else -> null }
                if (table.name == "transaction_notes") require(row.getString("reason").isNotBlank() && row.getString("reason").length <= 200) { "INVALID_FILE" }
                if (dateColumn != null && dateColumn in table.columns) iso(row.getString(dateColumn))
            }
        }
        fun rows(name: String) = data.getJSONArray(name).let { array -> (0 until array.length()).map { array.getJSONObject(it) } }
        fun ids(name: String) = rows(name).map { it.getString("id") }.toSet()
        val accounts = ids("accounts"); val products = ids("products"); val customers = ids("customers"); val sales = ids("sales")
        rows("transactions").forEach { require(it.getString("account_id") in accounts) { "INVALID_FILE" } }
        rows("sales").forEach { require(it.isNull("customerId") || it.getString("customerId") in customers) { "INVALID_FILE" } }
        rows("lines").forEach { require(it.getString("saleId") in sales && it.getString("productId") in products && it.getLong("quantity") > 0) { "INVALID_FILE" } }
        rows("payments").forEach { require(it.getString("saleId") in sales) { "INVALID_FILE" } }
        rows("movements").forEach { require(it.getString("productId") in products) { "INVALID_FILE" } }
        val saleLines = rows("lines").groupBy { it.getString("saleId") }
        val salePayments = rows("payments").groupBy { it.getString("saleId") }
        rows("sales").forEach { sale ->
            val lines = saleLines[sale.getString("id")] ?: emptyList()
            require(lines.isNotEmpty() && lines.sumOf { it.getLong("quantity") * it.getLong("priceCents") } == sale.getLong("totalCents")) { "INVALID_FILE" }
            require(lines.sumOf { it.getLong("quantity") * it.getLong("costCents") } == sale.getLong("costCents")) { "INVALID_FILE" }
            require((salePayments[sale.getString("id")] ?: emptyList()).sumOf { it.getLong("amountCents") } <= sale.getLong("totalCents")) { "INVALID_FILE" }
        }
        val lineMap = rows("lines").associateBy { it.getString("id") }
        val returned = rows("returns")
        returned.forEach { item ->
            val line = lineMap[item.getString("lineId")]
            require(line != null && item.getString("saleId") == line.getString("saleId")) { "INVALID_FILE" }
            require(item.getLong("quantity") > 0 && item.getInt("restocked") in setOf(0, 1)) { "INVALID_FILE" }
            require(item.getLong("amountCents") == item.getLong("quantity") * line.getLong("priceCents") && item.getLong("costCents") == item.getLong("quantity") * line.getLong("costCents")) { "INVALID_FILE" }
            require(item.getLong("refundCents") <= item.getLong("amountCents")) { "INVALID_FILE" }
        }
        returned.groupBy { it.getString("lineId") }.forEach { (lineId, items) ->
            require(items.sumOf { it.getLong("quantity") } <= lineMap[lineId]!!.getLong("quantity")) { "INVALID_FILE" }
        }
        rows("sales").forEach { sale ->
            val items = returned.filter { it.getString("saleId") == sale.getString("id") }
            val paid = (salePayments[sale.getString("id")] ?: emptyList()).sumOf { it.getLong("amountCents") }
            val refunds = items.sumOf { it.getLong("refundCents") }
            require(refunds <= paid && paid - refunds <= sale.getLong("totalCents") - items.sumOf { it.getLong("amountCents") }) { "INVALID_FILE" }
        }
        rows("adjustments").forEach { require(it.getString("productId") in products && it.getLong("quantityDelta") != 0L) { "INVALID_FILE" } }
        val suppliers = ids("suppliers")
        val purchases = rows("purchases")
        purchases.forEach { purchase ->
            require(purchase.getString("supplierId") in suppliers && purchase.getString("productId") in products && purchase.getLong("quantity") > 0 && purchase.getLong("totalCents") > 0) { "INVALID_FILE" }
            require(purchase.getLong("totalCents") == purchase.getLong("quantity") * purchase.getLong("costCents")) { "INVALID_FILE" }
            require(rows("supplierPayments").filter { it.getString("purchaseId") == purchase.getString("id") }.sumOf { it.getLong("amountCents") } <= purchase.getLong("totalCents")) { "INVALID_FILE" }
        }
        rows("supplierPayments").forEach { require(it.getString("purchaseId") in ids("purchases") && it.getLong("amountCents") > 0) { "INVALID_FILE" } }
        rows("user_settings").forEach { setting ->
            val key = setting.getString("key"); val value = setting.getString("value")
            if (key == "language") require(value in setOf("en", "am")) { "INVALID_FILE" }
            if (key in setOf("app_locked", "balance_hidden")) require(value in setOf("1", "0"))
            if (key == "preserve_restored_bank_data") require(value in setOf("true", "false")) { "INVALID_FILE" }
            if (key == "auto_lock_timeout") require(value.toIntOrNull() in setOf(-1, 0, 1, 5, 15, 30)) { "INVALID_FILE" }
            if (key.startsWith("custom_bank_")) {
                val bank = JSONObject(value)
                require(bank.get("bankName") is String && bank.get("senderId") is String && (bank.isNull("logoBase64") || bank.get("logoBase64") is String)) { "INVALID_FILE" }
            }
        }
    }
    fun restore(context: Context, payload: JSONObject) {
        validate(payload)
        connect(context).use { db ->
            db.beginTransaction()
            try {
                // Whitelisted identifiers and bound values only; no SQL from files.
                for (table in tables.reversed()) db.delete("${table.database}.${table.name}", null, null)
                for (table in tables) {
                    val rows = payload.getJSONObject("data").getJSONArray(table.name)
                    for (i in 0 until rows.length()) {
                        val row = rows.getJSONObject(i)
                        val values = ContentValues()
                        for (column in table.columns) when (val value = row.get(column)) {
                            JSONObject.NULL -> values.putNull(column)
                            is Number -> if (column in setOf("current_balance", "amount", "balance_after")) values.put(column, value.toDouble()) else values.put(column, value.toLong())
                            is String -> values.put(column, value)
                            else -> error("INVALID_FILE")
                        }
                        db.insertOrThrow("${table.database}.${table.name}", null, values)
                    }
                }
                db.execSQL("INSERT OR REPLACE INTO user_settings (key, value) VALUES ('preserve_restored_bank_data', 'true')")
                // Biometrics belong to this device, not the device that made the file.
                db.execSQL("INSERT OR REPLACE INTO user_settings (key, value) VALUES ('app_locked', '0')")
                db.setTransactionSuccessful()
            } finally { db.endTransaction() }
        }
    }
}
