# Analytics and transaction reasons

Open Analytics from the bottom navigation. Reports use the phone's local time and Gregorian calendar.

| Report | Inclusive dates |
| --- | --- |
| Week | Monday through Sunday |
| Month | First through last day of the selected month |
| Year | January 1 through December 31 of the selected year |

Use the left/right arrows to view earlier periods and return to the current one. Future periods are disabled. Comparisons use the previous complete calendar period. Monthly chart buckets follow Monday–Sunday weeks clipped to the month boundaries; yearly charts show January–December.

## Add or edit a reason

1. Find Recent transactions after the spending graph and chart.
2. Tap a transaction and write its reason, up to 200 characters.
3. Choose Save reason. Leave the field blank to remove an existing reason.

The list previews three transactions and expands to the latest ten in the selected report. It includes income and expenses. Reasons are personal annotations; they do not change amounts, original SMS text or category calculations. Cancelling does not save, and a failed save keeps the draft available to retry.

Reasons live in the `transaction_notes` table in `HisabApp.db`, keyed by SMS hash. Transaction reads join the notes onto bank records. SMS resync clears/rebuilds transaction records without deleting annotations. Backup format 3 includes the notes table; older backups restore with no notes.

The interface is available in English and Amharic. User-written text is not translated automatically.
