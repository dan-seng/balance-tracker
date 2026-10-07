package com.hisabapp.backup

import android.app.Activity
import android.content.Intent
import android.net.Uri
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.*
import com.facebook.react.uimanager.ViewManager
import org.json.JSONObject
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean
import javax.crypto.AEADBadTagException

class BackupModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
    private val worker = Executors.newSingleThreadExecutor()
    private val busy = AtomicBoolean(false)
    private var pickerPromise: Promise? = null
    private var encrypted: ByteArray? = null
    private var password: String? = null
    private var prepared: Pair<String, JSONObject>? = null
    private val listener = object : BaseActivityEventListener() {
        override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode != SAVE && requestCode != OPEN) return
            val promise = pickerPromise ?: return
            pickerPromise = null
            val bytes = encrypted; encrypted = null
            val secret = password; password = null
            val uri = data?.data
            if (resultCode != Activity.RESULT_OK || uri == null) {
                busy.set(false)
                if (requestCode == SAVE) promise.resolve(false) else promise.resolve(null)
                return
            }
            worker.execute {
                try {
                    if (requestCode == SAVE) {
                        context.contentResolver.openOutputStream(uri, "w").use { stream ->
                            requireNotNull(stream) { "FILE_ACCESS" }
                            stream.write(requireNotNull(bytes)); stream.flush()
                        }
                        promise.resolve(true)
                    } else {
                        val payload = JSONObject(String(BackupCrypto.decrypt(readLimited(uri), requireNotNull(secret)), Charsets.UTF_8))
                        BackupStore.validate(payload)
                        val token = java.util.UUID.randomUUID().toString()
                        prepared = token to payload
                        val map = Arguments.createMap()
                        map.putString("token", token)
                        map.putString("createdAt", payload.getString("createdAt"))
                        for (table in listOf("accounts", "transactions", "products", "customers", "sales", "expenses", "payments", "returns", "adjustments", "suppliers", "purchases", "transaction_notes"))
                            map.putInt(table, payload.getJSONObject("data").getJSONArray(table).length())
                        promise.resolve(map)
                    }
                } catch (error: Exception) { reject(promise, error) }
                finally { busy.set(false) }
            }
        }
    }
    init { context.addActivityEventListener(listener) }
    override fun getName() = "BackupModule"
    private fun readLimited(uri: Uri): ByteArray {
        context.contentResolver.openInputStream(uri).use { stream ->
            requireNotNull(stream) { "FILE_ACCESS" }
            val output = java.io.ByteArrayOutputStream()
            val buffer = ByteArray(64 * 1024)
            while (true) {
                val count = stream.read(buffer)
                if (count == -1) break
                require(output.size() + count <= BackupCrypto.MAX_BYTES + 128) { "TOO_LARGE" }
                output.write(buffer, 0, count)
            }
            return output.toByteArray()
        }
    }
    private fun reject(promise: Promise, error: Exception) {
        val code = when {
            error is AEADBadTagException -> "UNLOCK_FAILED"
            error.message in setOf("PASSWORD", "INVALID_FILE", "TOO_LARGE", "SCHEMA", "DATABASE", "FILE_ACCESS", "EXPIRED") -> error.message!!
            error is org.json.JSONException || error is IllegalArgumentException -> "INVALID_FILE"
            else -> "BACKUP_FAILED"
        }
        // Never send passwords, raw records or provider exception messages to logs/UI.
        promise.reject(code, code)
    }
    private fun begin(promise: Promise): Boolean {
        if (!busy.compareAndSet(false, true)) { promise.reject("BUSY", "BUSY"); return false }
        return true
    }
    private fun picker(intent: Intent, request: Int, promise: Promise) {
        val activity = context.currentActivity
        if (activity == null) {
            encrypted = null; password = null; busy.set(false)
            promise.reject("FILE_ACCESS", "FILE_ACCESS"); return
        }
        activity.runOnUiThread {
            try {
                pickerPromise = promise
                activity.startActivityForResult(intent, request)
            } catch (error: Exception) {
                pickerPromise = null; encrypted = null; password = null; busy.set(false)
                reject(promise, error)
            }
        }
    }
    @ReactMethod fun createBackup(secret: String, promise: Promise) {
        if (!begin(promise)) return
        worker.execute {
            try {
                val payload = BackupStore.snapshot(context)
                BackupStore.validate(payload)
                encrypted = BackupCrypto.encrypt(payload.toString().toByteArray(Charsets.UTF_8), secret)
                val date = java.text.SimpleDateFormat("yyyy-MM-dd-HHmm", java.util.Locale.US).format(java.util.Date())
                picker(Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "application/octet-stream"
                    putExtra(Intent.EXTRA_TITLE, "Hisab-$date.hisab")
                }, SAVE, promise)
            } catch (error: Exception) { encrypted = null; busy.set(false); reject(promise, error) }
        }
    }
    @ReactMethod fun previewRestore(secret: String, promise: Promise) {
        if (!begin(promise)) return
        prepared = null
        if (secret.length < 8) { busy.set(false); promise.reject("PASSWORD", "PASSWORD"); return }
        password = secret
        picker(Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE); type = "*/*"
        }, OPEN, promise)
    }
    @ReactMethod fun applyRestore(token: String, promise: Promise) {
        if (!begin(promise)) return
        worker.execute {
            try {
                val entry = prepared
                require(entry != null && entry.first == token) { "EXPIRED" }
                BackupStore.restore(context, entry.second)
                prepared = null
                promise.resolve(true)
            } catch (error: Exception) { reject(promise, error) }
            finally { busy.set(false) }
        }
    }
    @ReactMethod fun cancelRestore() { if (!busy.get()) prepared = null }
    override fun invalidate() {
        context.removeActivityEventListener(listener)
        encrypted = null; password = null; prepared = null
        worker.shutdown()
        super.invalidate()
    }
    companion object { private const val SAVE = 7461; private const val OPEN = 7462 }
}

class BackupPackage : ReactPackage {
    override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(BackupModule(context))
    override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
