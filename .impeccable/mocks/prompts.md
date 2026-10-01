# Shop layout previews

Generated using the built-in image_gen tool. Each variant used the following shared prompt followed by its composition instruction.

## Shared prompt

Use case: ui-mockup. Create a single high-fidelity portrait Android screen design for Hisab's new Shop ledger, 1024x1536. Existing design must be preserved: pure black canvas, #1C1C1E grouped surfaces, Poppins-like clean sans serif, white and gray labels, restrained muted gold #D8B45C primary action, green positive figures. Android status and bottom system bars, no phone hardware mockup. Readable generous touch controls. Bottom nav Wallet, Analytics, Shop (selected), Add Bank, Settings. Shop internal sections Overview, Stock, Customers. This is a design preview: visibly label Sample data. Exact illustrative totals Sales ETB 2,400, Cost of goods ETB 1,500, Expenses ETB 200, Profit ETB 700, Collected ETB 1,800, Unpaid ETB 600. Do not confuse sales with money collected. Recent activity with Coffee 2 packs ETB 600 and Soap 4 pieces ETB 240. No decorative photos, charts, glows, gradients.

## shop-daily-ledger.png

Composition A: daily ledger. Top Shop and Today period selector, large readable Profit 700 ETB, a flat calculation of Sales minus Cost of goods minus Expenses. Full-width Record sale action, secondary Restock and Add expense. Below concise Collected and Unpaid row and recent activity. Compact useful hierarchy, simple paper-ledger logic.

## shop-sale-first.png

Composition B: sale-first counter. Top Shop and large full-width Record sale action. Below horizontal Overview Stock Customers selector, a grouped Today's totals table with all six amounts, then equal secondary Restock and Add expense buttons, then recent activity. Focus recording transactions first, clear flat rows.

## shop-stock-first.png

Composition C: stock-first shop. Top Shop with Overview Stock Customers selector, compact Today totals summary all six metrics readable as two vertical columns, gold Record sale action, a flat Low stock list Soap 4 left, Coffee 2 left, with Restock buttons, Add expense action, followed by recent activity. Product inventory takes greater prominence without nested cards.

## Implementation interpretation

These are illustrative compositions, not real app screenshots or exact specifications. Retain platform system type, flat surfaces, accessible scalable text, and accurate reporting-period labels in code. Sample totals are demonstration data only. Composition C's selected Stock tab does not define final navigation behavior.
