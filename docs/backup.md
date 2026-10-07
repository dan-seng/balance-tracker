# Backup and restore

Open **Settings → Backup & restore**. Both flows are available in English and Amharic.

## Create a backup

1. Choose **Create backup**.
2. Enter and confirm a password with at least eight characters.
3. Choose a location using Android's file picker. Local storage and installed document providers, such as Google Drive, can be used.
4. Keep the `.hisab` file and its password. Hisab does not store or recover the password.

The file contains account/transaction history (including original SMS text), all Shop tables, including returns, corrections and supplier debts/payments, customer balances/payments, custom banks, transaction reasons and preferences. It is encrypted on the device before being passed to the storage provider. There is no Hisab server, automatic upload, storage account requirement or broad storage permission.

## Restore a backup

1. Choose **Restore backup**, enter the file's password and select its `.hisab` file.
2. Review the date and record counts. Validation happens before replacement.
3. Leave **Back up my current records first** enabled to save a safety copy. It uses the password entered for restoration. Cancelling that save aborts replacement.
4. Choose **Replace my records**. This replaces both databases and preferences; it does not merge records. The SMS inbox is untouched.

App lock is disabled after restore so biometrics can be set up on the destination phone. Language and other preferences are restored. Subsequent inbox imports merge/deduplicate messages instead of deleting restored bank history, and older messages do not overwrite a newer saved balance, allowing restoration onto a phone without the original SMS messages.

## Implementation

- Versioned binary envelope with a fixed header, random 16-byte salt and 12-byte nonce, AES-256-GCM authentication and PBKDF2-HMAC-SHA256 (600,000 iterations). Older providers use an equivalent HMAC derivation fallback.
- Passwords remain transient in memory. No plaintext temporary files are written.
- Decrypted payload version 3 (version 1 and 2 files migrate with empty tables for newer features) includes only known tables and columns. Validation checks field types, IDs, references, sale totals and payments, preferences and record limits. The plaintext limit is 32 MiB with at most 200,000 rows.
- Native file I/O, cryptography and database work run on a worker thread. Incoming SMS writes queue behind backup/restore work; the Shop queue is drained before starting.
- A single SQLite transaction spans the bank database and attached Shop database. Errors roll back replacement. No SQL or schema definitions are accepted from a backup file.
- File selection cancellation is a normal result. Wrong passwords, tampered/truncated files and unsupported formats do not reach replacement.

Native changes require rebuilding and reinstalling the Android app; Metro alone cannot add the module.

## Checks

```sh
npm test -- --runInBand
npx tsc --noEmit
cd android
./gradlew app:assembleDebug app:assembleDebugAndroidTest -PreactNativeArchitectures=x86_64
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb install -r app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
adb shell am instrument -w com.hisabapp.test/com.hisabapp.backup.BackupInstrumentation
```

The native checks use isolated temporary databases and never open the user's databases. They cover encryption round trips, wrong passwords, tampering, truncation, native validation, bank/Shop restoration and rollback after a forced write failure. React tests cover credential validation, preview, safety-copy cancellation, confirmation and preservation of restored history on reopening.

Completed verification: 50 Jest tests, TypeScript and changed-file lint passed. Android app/test APK builds succeeded; all 29 isolated native checks passed. The emulator file-picker walkthrough saved a real encrypted `.hisab` file and displayed success.

Transaction reasons are stored separately by SMS hash and included in backup version 3. Native app and test APK builds pass for version 3; its new cases were not run on an emulator, which remains off.
