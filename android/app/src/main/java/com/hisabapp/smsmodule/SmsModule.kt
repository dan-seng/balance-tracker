package com.hisabapp.smsmodule

import android.content.Context
import android.provider.Telephony
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.uimanager.ViewManager

class SmsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    init {
        sharedReactContext = reactContext
    }

    override fun getName(): String {
        return "SmsModule"
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Keep: Required for RN built-in Event Emitter Calls
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Keep: Required for RN built-in Event Emitter Calls
    }

    @ReactMethod
    fun getSavedSms(promise: Promise) {
        try {
            val queue = SmsReceiver.getSavedSmsQueue(reactApplicationContext)
            val smsList = Arguments.createArray()
            for (i in 0 until queue.length()) {
                val smsObj = queue.getJSONObject(i)
                val smsMap = Arguments.createMap()
                smsMap.putString("sender", smsObj.getString("sender"))
                smsMap.putString("message", smsObj.getString("message"))
                smsMap.putDouble("timestamp", smsObj.getLong("timestamp").toDouble())
                if (smsObj.has("subId") && !smsObj.isNull("subId")) {
                    smsMap.putInt("subId", smsObj.getInt("subId"))
                }
                smsList.pushMap(smsMap)
            }
            promise.resolve(smsList)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun clearSavedSms(promise: Promise) {
        try {
            SmsReceiver.clearSmsQueue(reactApplicationContext)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getInboxSms(limit: Int, promise: Promise) {
        try {
            val smsList = Arguments.createArray()
            val projection = arrayOf(
                Telephony.Sms.ADDRESS,
                Telephony.Sms.BODY,
                Telephony.Sms.DATE,
                Telephony.Sms.SUBSCRIPTION_ID,
            )
            val sortOrder = "${Telephony.Sms.DATE} DESC"
            val cursor = reactApplicationContext.contentResolver.query(
                Telephony.Sms.Inbox.CONTENT_URI,
                projection,
                null,
                null,
                sortOrder,
            )

            cursor?.use {
                val addressIndex = it.getColumnIndex(Telephony.Sms.ADDRESS)
                val bodyIndex = it.getColumnIndex(Telephony.Sms.BODY)
                val dateIndex = it.getColumnIndex(Telephony.Sms.DATE)
                val subIdIndex = it.getColumnIndex(Telephony.Sms.SUBSCRIPTION_ID)
                var count = 0
                val maxItems = if (limit > 0) limit else Int.MAX_VALUE

                while (it.moveToNext() && count < maxItems) {
                    val smsMap = Arguments.createMap()
                    smsMap.putString("sender", it.getString(addressIndex) ?: "")
                    smsMap.putString("message", it.getString(bodyIndex) ?: "")
                    smsMap.putDouble("timestamp", it.getLong(dateIndex).toDouble())
                    if (subIdIndex >= 0 && !it.isNull(subIdIndex)) {
                        smsMap.putInt("subId", it.getInt(subIdIndex))
                    }
                    smsList.pushMap(smsMap)
                    count++
                }
            }

            promise.resolve(smsList)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    companion object {
        private var sharedReactContext: ReactApplicationContext? = null

        fun sendSmsEvent(context: Context?, sender: String, message: String, timestamp: Long, subId: Int?) {
            val reactContext = sharedReactContext

            if (reactContext != null && reactContext.hasActiveReactInstance()) {
                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onSmsReceived", Arguments.createMap().apply {
                        putString("sender", sender)
                        putString("message", message)
                        putDouble("timestamp", timestamp.toDouble())
                        if (subId != null) {
                            putInt("subId", subId)
                        }
                    })
            }
        }
    }
}

class SmsPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> {
        return mutableListOf(SmsModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): MutableList<ViewManager<*, *>> {
        return mutableListOf()
    }
}
