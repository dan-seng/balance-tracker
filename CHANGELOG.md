# Changelog

## Android 1.1.0 — October 7, 2026

### Added

- Password-protected `.hisab` backup files, validation previews and a safety-copy option before replacement.
- Returns/refunds, stock corrections with reasons, supplier purchases on credit and supplier payments.
- Shareable daily closing summaries and customer statements.
- Calendar reports with previous/next navigation: Monday–Sunday weeks, complete months and January–December years.
- Editable reasons for recent bank transactions, retained across SMS reimports and included in backups.

### Improved

- Compact Shop profit/loss card with an optional calculation, separate received-money/debt rows, grouped navigation and clearer forms.
- In-app sale-discard confirmation that preserves the draft when editing continues or Android Back is pressed.
- English and Amharic coverage; Amharic uses Nokia Pure.
- Settings developer credit now names Daniel Gidey.

### Fixed

- Recipient phone numbers and references no longer identify bank accounts.
- Missing account hints reuse a single known account; explicitly different accounts remain separate.
- Safaricom messages are excluded from account imports.
- Historical SMS messages no longer overwrite a newer saved balance.

### Distribution and checks

- Android version code 2, signed with the existing certificate to support updates.
- Approximately 28 MB APK containing 32-bit and 64-bit ARM libraries.
- Website downloads use the bundled, versioned APK; automated releases build the same ARM architectures.
- All 55 Jest tests, TypeScript, changed-file lint and the release build passed.
- Backup format 3 includes transaction reasons and accepts format 1/2 backups through migration. Its native code/test APKs build; the newest cases were not run on an emulator.
