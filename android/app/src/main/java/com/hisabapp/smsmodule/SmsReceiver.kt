package com.hisabapp.smsmodule

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.telephony.SmsMessage
import android.util.Log
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONArray
import org.json.JSONObject

class SmsReceiver : BroadcastReceiver() {
    companion object {
        private const val PREFS_NAME = "SmsStorage"
        private const val SMS_QUEUE_KEY = "sms_queue"

        fun saveSmsToStorage(context: Context?, sender: String, message: String, timestamp: Long, subId: Int?) {
            if (context == null) return

            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val queueJson = prefs.getString(SMS_QUEUE_KEY, "[]")
            val queue = JSONArray(queueJson)

            val smsObj = JSONObject().apply {
                put("sender", sender)
                put("message", message)
                put("timestamp", timestamp)
                if (subId != null) {
                    put("subId", subId)
                }
            }

            queue.put(smsObj)
            prefs.edit().putString(SMS_QUEUE_KEY, queue.toString()).apply()
            Log.d("SmsReceiver", "Saved SMS to storage: $sender")
        }

        fun getSavedSmsQueue(context: Context?): JSONArray {
            if (context == null) return JSONArray()

            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val queueJson = prefs.getString(SMS_QUEUE_KEY, "[]")
            return JSONArray(queueJson)
        }

        fun clearSmsQueue(context: Context?) {
            if (context == null) return

            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().remove(SMS_QUEUE_KEY).apply()
            Log.d("SmsReceiver", "Cleared SMS queue")
        }
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        Log.d("SmsReceiver", "SMS received!")
        if (intent?.action == "android.provider.Telephony.SMS_RECEIVED") {
            val bundle = intent.extras
            if (bundle != null) {
                val pdus = bundle.get("pdus") as Array<ByteArray>
                Log.d("SmsReceiver", "PDUs: ${pdus.size}")
                for (pdu in pdus) {
                    val smsMessage = SmsMessage.createFromPdu(pdu)
                    val sender = smsMessage.displayOriginatingAddress
                    val message = smsMessage.messageBody
                    val timestamp = smsMessage.timestampMillis
                    // AOSP injects "subscription" (subId) into the broadcast
                    // extras; not formally public, but widely present since API 22.
                    val subId: Int? = intent.getIntExtra("subscription", -1).takeIf { it >= 0 }

                    Log.d("SmsReceiver", "SMS from $sender: $message")

                    // Save to storage for later processing
                    saveSmsToStorage(context, sender, message, timestamp, subId)

                    // Try to emit event if React Native is running
                    SmsModule.sendSmsEvent(context, sender, message, timestamp, subId)
                }
            }
        }
    }
}
