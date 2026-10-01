# Hisab

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

People tracking Ethiopian bank and wallet balances. The Shop feature serves small shop owners replacing handwritten stock, sales, expense, profit, and customer-credit records.

## Product Purpose

Turn bank SMS into local account records and give shop owners a practical daily ledger on the same phone.

## Capabilities and Constraints

Existing implementation: React Native, TypeScript, native Android SMS access, ETB amounts, SQLite storage, biometric app lock, and local analytics. SMS import rebuilds its own account and transaction tables.

Confirmed Shop scope: stock, sales, expenses, profit, unpaid customer balances, and repayments. Shop records must survive SMS resyncs and app restarts. No cloud service or payment processing is part of this request.

## Operating Context

Owners currently write and calculate shop records using paper and pen. Workflows should support quick recording and understandable totals.

## Open Decisions

Supplier credit, taxes, multi-shop support, backup/export, and automatic matching of sales to SMS are outside the confirmed first-version scope.
