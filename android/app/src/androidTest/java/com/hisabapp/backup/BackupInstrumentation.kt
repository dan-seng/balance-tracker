package com.hisabapp.backup

import android.app.Activity
import android.app.Instrumentation
import android.content.ContextWrapper
import android.database.sqlite.SQLiteDatabase
import android.os.Bundle
import org.json.JSONObject
import org.json.JSONArray
import java.io.File

// Runs native crypto and SQLite regressions in an isolated directory; it never
// opens or alters the app user's databases. No test library/runtime dependency.
class BackupInstrumentation : Instrumentation() {
    override fun onCreate(arguments: Bundle?) { super.onCreate(arguments); start() }
    override fun onStart() {
        val results = Bundle()
        val folder = File(targetContext.cacheDir, "backup-instrumentation-${System.nanoTime()}").apply { mkdirs() }
        val isolated = object : ContextWrapper(targetContext) {
            override fun getDatabasePath(name: String) = File(folder, name)
        }
        var checks = 0
        fun checkThat(condition: Boolean) { check(condition); checks++ }
        fun fails(block: () -> Unit) { var failed = false; try { block() } catch (_: Exception) { failed = true }; checkThat(failed) }
        try {
            val plain = "ሂሳብ secret records".toByteArray(Charsets.UTF_8)
            val encrypted = BackupCrypto.encrypt(plain, "test-password")
            checkThat(!encrypted.contentEquals(BackupCrypto.encrypt(plain, "test-password")))
            checkThat(BackupCrypto.decrypt(encrypted, "test-password").contentEquals(plain))
            fails { BackupCrypto.decrypt(encrypted, "wrong-password") }
            val damaged = encrypted.copyOf().apply { this[lastIndex] = (this[lastIndex].toInt() xor 1).toByte() }
            fails { BackupCrypto.decrypt(damaged, "test-password") }
            fails { BackupCrypto.decrypt(encrypted.copyOf(encrypted.size - 2), "test-password") }
            fails { BackupCrypto.encrypt(plain, "short") }
            SQLiteDatabase.openOrCreateDatabase(isolated.getDatabasePath("HisabApp.db"), null).use { db ->
                db.execSQL("CREATE TABLE accounts (id TEXT PRIMARY KEY, bank_id TEXT, bank_name TEXT, account_number TEXT, current_balance REAL, currency TEXT, last_updated TEXT, source TEXT, sub_id INTEGER)")
                db.execSQL("CREATE TABLE transactions (id TEXT PRIMARY KEY, account_id TEXT, bank_id TEXT, bank_name TEXT, type TEXT, amount REAL, balance_after REAL, date TEXT, raw_sms TEXT, hash TEXT, currency TEXT, sender TEXT)")
                db.execSQL("CREATE TABLE user_settings (key TEXT PRIMARY KEY, value TEXT)")
                db.execSQL("CREATE TABLE transaction_notes (hash TEXT PRIMARY KEY, reason TEXT, updated_at TEXT)")
            }
            SQLiteDatabase.openOrCreateDatabase(isolated.getDatabasePath("HisabShop.db"), null).use { db ->
                db.execSQL("CREATE TABLE products (id TEXT PRIMARY KEY, name TEXT, unit TEXT, quantity INTEGER, costCents INTEGER, priceCents INTEGER, lowStock INTEGER)")
                db.execSQL("CREATE TABLE customers (id TEXT PRIMARY KEY, name TEXT, phone TEXT)")
                db.execSQL("CREATE TABLE sales (id TEXT PRIMARY KEY, customerId TEXT, date TEXT, totalCents INTEGER, costCents INTEGER)")
                db.execSQL("CREATE TABLE lines (id TEXT PRIMARY KEY, saleId TEXT, productId TEXT, name TEXT, unit TEXT, quantity INTEGER, priceCents INTEGER, costCents INTEGER)")
                db.execSQL("CREATE TABLE payments (id TEXT PRIMARY KEY, saleId TEXT, date TEXT, amountCents INTEGER, kind TEXT)")
                db.execSQL("CREATE TABLE expenses (id TEXT PRIMARY KEY, date TEXT, description TEXT, category TEXT, amountCents INTEGER)")
                db.execSQL("CREATE TABLE movements (id TEXT PRIMARY KEY, productId TEXT, date TEXT, kind TEXT, quantity INTEGER, amountCents INTEGER)")
                db.execSQL("CREATE TABLE returns (id TEXT PRIMARY KEY, saleId TEXT, lineId TEXT, date TEXT, quantity INTEGER, amountCents INTEGER, costCents INTEGER, refundCents INTEGER, restocked INTEGER)")
                db.execSQL("CREATE TABLE adjustments (id TEXT PRIMARY KEY, productId TEXT, date TEXT, quantityDelta INTEGER, costCents INTEGER, reason TEXT)")
                db.execSQL("CREATE TABLE suppliers (id TEXT PRIMARY KEY, name TEXT, phone TEXT)")
                db.execSQL("CREATE TABLE purchases (id TEXT PRIMARY KEY, supplierId TEXT, productId TEXT, date TEXT, quantity INTEGER, costCents INTEGER, totalCents INTEGER)")
                db.execSQL("CREATE TABLE supplierPayments (id TEXT PRIMARY KEY, purchaseId TEXT, date TEXT, amountCents INTEGER)")
            }
            val payload = BackupStore.snapshot(isolated)
            val data = payload.getJSONObject("data")
            data.getJSONArray("accounts").put(JSONObject("""{"id":"a","bank_id":"cbe","bank_name":"CBE","account_number":"1234567890","current_balance":1000.5,"currency":"ETB","last_updated":"2026-10-07T10:00:00.000Z","source":"sms","sub_id":null}"""))
            data.getJSONArray("transactions").put(JSONObject("""{"id":"t","account_id":"a","bank_id":"cbe","bank_name":"CBE","type":"credit","amount":1000.5,"balance_after":1000.5,"date":"2026-10-07T10:00:00.000Z","raw_sms":"private test SMS","hash":"hash","currency":"ETB","sender":"CBE"}"""))
            data.getJSONArray("user_settings").put(JSONObject("""{"key":"username","value":"Test Owner"}""")).put(JSONObject("""{"key":"language","value":"am"}""")).put(JSONObject("""{"key":"app_locked","value":"1"}"""))
            data.getJSONArray("products").put(JSONObject("""{"id":"p","name":"Coffee","unit":"packs","quantity":2,"costCents":10000,"priceCents":15000,"lowStock":1}"""))
            data.getJSONArray("customers").put(JSONObject("""{"id":"c","name":"Customer","phone":""}"""))
            data.getJSONArray("sales").put(JSONObject("""{"id":"s","customerId":"c","date":"2026-10-07T10:00:00.000Z","totalCents":15000,"costCents":10000}"""))
            data.getJSONArray("lines").put(JSONObject("""{"id":"l","saleId":"s","productId":"p","name":"Coffee","unit":"packs","quantity":1,"priceCents":15000,"costCents":10000}"""))
            data.getJSONArray("payments").put(JSONObject("""{"id":"pay","saleId":"s","date":"2026-10-07T10:00:00.000Z","amountCents":5000,"kind":"sale"}"""))
            data.getJSONArray("expenses").put(JSONObject("""{"id":"e","date":"2026-10-07T10:00:00.000Z","description":"Rent","category":"Rent","amountCents":1000}"""))
            data.getJSONArray("movements").put(JSONObject("""{"id":"m","productId":"p","date":"2026-10-07T10:00:00.000Z","kind":"sale","quantity":-1,"amountCents":10000}"""))
            data.getJSONArray("returns").put(JSONObject("""{"id":"r","saleId":"s","lineId":"l","date":"2026-10-07T11:00:00.000Z","quantity":1,"amountCents":15000,"costCents":10000,"refundCents":5000,"restocked":1}"""))
            data.getJSONArray("adjustments").put(JSONObject("""{"id":"adj","productId":"p","date":"2026-10-07T11:00:00.000Z","quantityDelta":-1,"costCents":10000,"reason":"Damaged"}"""))
            data.getJSONArray("suppliers").put(JSONObject("""{"id":"sup","name":"Supplier","phone":""}"""))
            data.getJSONArray("purchases").put(JSONObject("""{"id":"buy","supplierId":"sup","productId":"p","date":"2026-10-07T11:00:00.000Z","quantity":1,"costCents":10000,"totalCents":10000}"""))
            data.getJSONArray("supplierPayments").put(JSONObject("""{"id":"spay","purchaseId":"buy","date":"2026-10-07T11:00:00.000Z","amountCents":2000}"""))
            data.getJSONArray("transaction_notes").put(JSONObject("""{"hash":"hash","reason":"Customer payment","updated_at":"2026-10-07T11:00:00.000Z"}"""))
            val versionTwo = JSONObject(payload.toString()).put("version", 2)
            versionTwo.getJSONObject("data").remove("transaction_notes")
            BackupStore.validate(versionTwo)
            checkThat(versionTwo.getInt("version") == 3 && versionTwo.getJSONObject("data").getJSONArray("transaction_notes").length() == 0)
            val legacy = JSONObject(payload.toString()).put("version", 1)
            for (table in listOf("returns", "adjustments", "suppliers", "purchases", "supplierPayments", "transaction_notes")) legacy.getJSONObject("data").remove(table)
            BackupStore.validate(legacy)
            checkThat(legacy.getInt("version") == 3 && legacy.getJSONObject("data").getJSONArray("returns").length() == 0)
            BackupStore.validate(payload)
            val decoded = JSONObject(String(BackupCrypto.decrypt(BackupCrypto.encrypt(payload.toString().toByteArray(), "test-password"), "test-password")))
            BackupStore.restore(isolated, decoded)
            val restored = BackupStore.snapshot(isolated).getJSONObject("data")
            for (table in listOf("accounts", "transactions", "products", "customers", "sales", "lines", "payments", "expenses", "movements", "returns", "adjustments", "suppliers", "purchases", "supplierPayments", "transaction_notes")) checkThat(restored.getJSONArray(table).toString() == data.getJSONArray(table).toString())
            val preferences = restored.getJSONArray("user_settings").let { a -> (0 until a.length()).associate { a.getJSONObject(it).getString("key") to a.getJSONObject(it).getString("value") } }
            checkThat(preferences["app_locked"] == "0" && preferences["preserve_restored_bank_data"] == "true" && preferences["language"] == "am")
            val badReference = JSONObject(payload.toString()).apply { getJSONObject("data").getJSONArray("transactions").getJSONObject(0).put("account_id", "missing") }
            fails { BackupStore.restore(isolated, badReference) }
            val overpaid = JSONObject(payload.toString()).apply { getJSONObject("data").getJSONArray("payments").getJSONObject(0).put("amountCents", 15001) }
            fails { BackupStore.validate(overpaid) }
            val unknownVersion = JSONObject(payload.toString()).put("version", 99)
            fails { BackupStore.validate(unknownVersion) }
            SQLiteDatabase.openDatabase(isolated.getDatabasePath("HisabShop.db").path, null, SQLiteDatabase.OPEN_READWRITE).use { it.execSQL("CREATE TRIGGER fail_restore BEFORE INSERT ON expenses BEGIN SELECT RAISE(ABORT, 'test failure'); END") }
            val changed = JSONObject(payload.toString()).apply { getJSONObject("data").getJSONArray("accounts").getJSONObject(0).put("current_balance", 42) }
            fails { BackupStore.restore(isolated, changed) }
            val afterFailure = BackupStore.snapshot(isolated).getJSONObject("data")
            checkThat(afterFailure.getJSONArray("accounts").getJSONObject(0).getDouble("current_balance") == 1000.5)
            checkThat(afterFailure.getJSONArray("products").toString() == restored.getJSONArray("products").toString())
            checkThat(afterFailure.getJSONArray("expenses").toString() == restored.getJSONArray("expenses").toString())
            results.putString("stream", "Native backup checks passed: $checks\n")
            finish(Activity.RESULT_OK, results)
        } catch (error: Throwable) {
            results.putString("stream", "Native backup checks failed after $checks: ${error.javaClass.simpleName}: ${error.message}\n${error.stackTraceToString()}")
            finish(Activity.RESULT_CANCELED, results)
        } finally { folder.deleteRecursively() }
    }
}
