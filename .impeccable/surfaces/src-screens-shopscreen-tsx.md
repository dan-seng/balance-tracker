---
version: 1
slug: "src-screens-shopscreen-tsx"
primary_target: "src/screens/ShopScreen.tsx"
related_targets: ["src/components/BottomNav.tsx"]
---

# Shop daily ledger

Mode: Operate. Small shop owners replace handwritten daily sales, stock, expenses and customer-credit records.

Approved direction: A, daily ledger. Preserve Hisab's system type, dark grouped surfaces and restrained gold actions. Lead with profit and its calculation, then recording actions, collections and all-time unpaid balances.

Approved comp: .impeccable/mocks/shop-daily-ledger.png. The comp is synthetic; the shipped screen displays real user records and honest empty states. Source contract uses surface seed 31d9d944.

Implementation media: totals, rows, controls, forms and dialogs are native React Native components; navigation icon is code-native SVG. No raster UI text or decorative imagery is shipped. Stacked calculation rows, readable period selection and explicit all-time debt labels intentionally adapt the comp for mobile and scalable text.

Entry flows: products and opening stock, restock, multi-item sales, expenses, inline customer creation, partial payments and repayments. Whole-unit inventory and integer santim accounting. Historical sale costs are immutable snapshots. Dedicated shop SQLite database survives SMS sync; native library promise mode initializes once.

Review: source finishing review completed; explicit period chooser, customer amount width, inline customer creation and scope documentation fixes applied. Design system documented from final source. Detector findings: none.

Verification: all 12 Jest tests pass, including actual SQLite query lifecycle and sale-draft interaction; TypeScript and changed-file ESLint pass. Native screenshots and final APK build were not completed after emulator inspection and follow-up build authorization were declined.

Comprehension refinement: Daily totals / Products / Customers navigation, Buy stock action, question-based form labels, optional four-step help, first-product entry action, explicit Loss label and clearer distinction between profit, money received and customer debt. Both languages share the same flows; Amharic uses bundled Nokia Pure. Android layouts and guide expansion inspected; all 17 tests and TypeScript pass.
