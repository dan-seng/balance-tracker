# Hisab

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

People tracking Ethiopian bank and wallet balances. The Shop feature serves small shop owners replacing handwritten stock, sales, expense, profit, and customer-credit records.

## Product Purpose

Turn bank SMS into local account records and give shop owners a practical daily ledger on the same phone.

## Capabilities and Constraints

Existing implementation: React Native, TypeScript, native Android SMS access, ETB amounts, SQLite storage, biometric app lock, English/Amharic interfaces and calendar analytics. Transaction reasons are stored separately by SMS hash. Restored bank history is preserved when importing messages.

Implemented Shop scope: stock, sales, expenses, profit, customer debt/payments, returns/refunds, audited stock corrections, supplier credit/payments and shareable daily/customer reports. Shop records survive SMS resyncs and restarts. Manual encrypted file backup/restore includes bank data, Shop records, reasons and preferences. There is no Hisab cloud service or payment processing; users explicitly choose backup and share destinations.

## Operating Context

Owners currently write and calculate shop records using paper and pen. Workflows should support quick recording and understandable totals.

## Open Decisions

Taxes, multi-shop support, fractional quantities, CSV/PDF export and automatic reconciliation of shop sales with bank SMS remain outside the implemented scope.
