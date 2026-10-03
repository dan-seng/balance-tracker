# Shop ledger: confirmed scope and implementation plan

## User-approved scope

Small shop owners need stock, sales, expenses, profit, customer credit balances, and repayments inside Hisab. Records are entered manually and stored offline in ETB.

## Workflows

1. Add a product: name, unit label, opening quantity, cost per unit, and default selling price.
2. Restock: select a product, quantity, and purchase cost. Increase stock and update its weighted average cost.
3. Record a sale: select product(s), quantities, actual selling prices, and amount received. Reduce stock. Require a customer when any balance remains unpaid; create a new customer inline while keeping the sale draft if needed.
4. Add an expense: description, category, and amount. Stock purchases have their own workflow to avoid counting them twice as expenses.
5. View a customer: outstanding sales and repayment history. Record a repayment against an unpaid sale; prevent overpayment.
6. View the ledger: sales, cost of goods sold, operating expenses, profit, cash collected, and customer balances.

## Calculation rules

- Sales = quantity × selling price across completed sales.
- Cost of goods sold uses the product's cost captured when each sale is recorded.
- Profit = sales − cost of goods sold − recorded operating expenses.
- Buying unsold stock changes inventory value and cash outflow, rather than immediately reducing profit.
- Collections include sale payments and later repayments received in the selected period; repayments never create a second sale or second profit.
- Outstanding = sale total − payments applied to that sale.
- Profit may be negative. Outstanding and stock must not become negative through ordinary entry.
- Store ETB amounts as integer santim. Define and test rounding of weighted average costs explicitly.
- Display what each total includes. Profit is based on entered records; it is not a statement of bank balance.

## Persistence and integration

Use separate SQLite shop tables for products, sales, sale lines, expenses, and payments, with stock movements for traceability. SMS resync must not delete these tables. Link stock updates and sale creation in one database transaction, guard duplicate submissions, and preserve historical unit costs and prices.

Add Shop to the existing bottom navigation and preserve Wallet, Analytics, Add Bank, and Settings. Shop initially uses manual records; automatic matching to SMS is outside this scope because it needs an explicit reconciliation workflow to prevent double-counting.

## Interface direction

Operate mode: owners enter transactions throughout the day and check totals at closing. Inherit Hisab's dark surfaces, system type through AppText, gold accent, semantic green/red, and simple grouped rows. Keep Android Back, accessible labels, large touch targets, and keyboard clearance. Generated comps use a clean sans serif as a hierarchy reference; implementation retains the platform font.

Structural candidates considered: (1) sale-first counter, (2) product-first inventory, (3) customer-credit ledger, (4) daily ledger, (5) chronological cashbook, (6) closing-day worksheet, (7) compact task launcher. The design skill selected candidate 4, daily ledger (seed 31d9d944). External catalog was unavailable after a network-enabled retry. Preview compositions will compare daily ledger, sale-first, and stock-first while preserving the same visual system.

## Verification plan

Test full and partial payments, repayments without duplicate revenue, insufficient stock, changing purchase costs, negative profit, invalid monetary input, duplicate submissions, and persistence across reopening and SMS resync. Check TypeScript and lint, then verify Android layout and workflows when a device or emulator is available.

## Pending

Daily-ledger composition A is approved and implemented. Supplier credit, taxes, multi-shop, backup/export, stock adjustments/returns, and fractional product quantities need explicit design if included later; they are not promised as implemented features.

## Completed validation

All 12 Jest tests pass, including the database lifecycle, accounting, inline customer creation while keeping a sale draft, and access to Shop when SMS permission is declined. TypeScript and lint for the changed application/test files pass. SQLite promise configuration is shared once across the bank and shop databases. Finishing source-review fixes are applied.

Native layout screenshots and a completed APK build remain unverified: emulator inspection and the follow-up debug-build authorization were declined. Generated previews are design references rather than runtime screenshots.

## Plain-language Shop interface

The Shop screen now calls its overview **Daily totals** and its stock tab **Products**. **Buy stock** adds purchased items; **Add expense** records running costs. **Money received** includes sale payments and debt payments, while **Customers owe** shows all unpaid sales. Negative profit is explicitly labelled **Loss**.

A collapsible **How to use Shop** guide explains the four steps and gives a 100 ETB purchase / 150 ETB sale example. New shops have a direct **Add your first product** starting point. Forms ask practical questions about quantities, buying/selling prices and money paid. These changes are available in English and Amharic without changing accounting or saved records.
