---
name: Hisab
description: A local finance interface with a practical daily shop ledger.
colors:
  background: "#000000"
  grouped1: "#1C1C1E"
  grouped2: "#2C2C2E"
  label: "#FFFFFF"
  label2: "rgba(235, 235, 245, 0.60)"
  separator: "rgba(84, 84, 88, 0.55)"
  gold: "#D8B45C"
  green: "#30D158"
  red: "#FF453A"
  gold-highlight: "#2B2210"
  gold-mid: "#17140D"
  nav-inactive: "rgba(235, 235, 245, 0.35)"
  film: "rgba(22, 22, 24, 0.92)"
typography:
  display:
    fontSize: "36px"
    fontWeight: 700
  headline:
    fontSize: "34px"
    fontWeight: 700
  title:
    fontSize: "21px"
    fontWeight: 600
  body:
    fontSize: "14px"
    lineHeight: 1.5
  label:
    fontSize: "15px"
    fontWeight: 600
  small:
    fontSize: "12px"
    lineHeight: 1.5
rounded:
  lg: "12px"
  xl: "16px"
spacing:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold-mid}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
  button-secondary:
    backgroundColor: "{colors.grouped2}"
    textColor: "{colors.label}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
  input:
    backgroundColor: "{colors.grouped1}"
    textColor: "{colors.label}"
    rounded: "{rounded.lg}"
    padding: "12px 14px"
  card:
    backgroundColor: "{colors.grouped1}"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# Design System: Hisab

## Overview

**Creative North Star: "Hisab incumbent interface"**

Hisab uses a black canvas, flat dark grouped surfaces, system typography and restrained gold actions. White amounts establish hierarchy; secondary labels recede while green and red communicate income and spending.

The Shop extension carries the wallet’s warm gold totals surface and Settings’ grouped navigation into a practical daily ledger. Entry speed, readable amounts, validation and honest totals take priority over decoration. This document records source evidence; runtime rendering has not been inspected.

**Key Characteristics:**
- Black canvas and tonal grouping
- System text and clear numeric hierarchy
- Gold actions; green and red financial meanings
- Persistent navigation and modal entry

## Colors

The incumbent palette combines black and dark neutral surfaces with gold identity and financial status colors. Frontmatter records the recurring values used by Shop and navigation; the theme retains additional legacy and screen-specific tokens.

### Primary

- **Hisab Gold:** Primary actions, selected section labels and underline, notices, and selected choice borders.

### Secondary

- **Income Green:** Positive financial values.
- **Spending Red:** Negative values and validation errors.

### Neutral

- **Black Canvas:** Screen background.
- **Grouped Dark / Grouped Raised:** Summary panels, fields and secondary actions.
- **White Label / Secondary Label:** Amounts and titles / supporting explanation.
- **Separator:** Quiet hairline row boundaries.
- **Navigation Film / Inactive Label:** Bottom navigation background and unselected tabs.
- **Gold Highlight / Gold Mid:** Selected choice surface / dark primary-action text.

**The Meaning Before Accent Rule.** Use gold for action and selection, green for positive financial values, and red for negative values and errors.

## Typography

**Display and Body Font:** Platform system font; AppText does not force a font family. Poppins remains available in the theme and is not the default wrapper face.

The hierarchy is numeric and direct. Shop uses compact 28 dp extra-bold profit amounts, 32 dp extra-bold screen titles and 20 dp extra-bold section headings, matching the weight and hierarchy of the wallet and Settings. Row titles and inputs use 16 dp; collection figures use 23 dp semibold. The persistent bottom navigation retains its incumbent 10 dp medium labels.

**The Amount Before Annotation Rule.** Give totals stronger size and weight than their explanatory labels; use tabular numerals for ledger amounts.

## Layout

Phone screens use vertically scrolling content with 20 dp horizontal gutters and 20 dp section gaps in Shop; entry forms retain 16 dp gaps. The compact profit summary uses 18 dp horizontal and 12 dp vertical padding; forms use 20 dp. Inline row spacing uses 8–16 dp; financial rows, collection groups and section headings wrap as needed. No fixed responsive breakpoints are present.

Persistent bottom navigation overlays the screen edge. Shop reserves 100 dp plus the bottom safe-area inset for clearance. Navigation respects the bottom inset and hides during keyboard display. Modal entry uses safe-area layout and keyboard avoidance; Shop enables text scaling explicitly and handles Android Back. These are extension rules, not claims that all incumbent screens already implement them.

## Elevation & Depth

Depth comes from dark surface tones and hairline separators. Shop mirrors the wallet’s dark gold gradient and quiet gold border for the profit summary, while controls, lists and dialogs retain flat grouped surfaces without decorative shadows. Dialogs dim the canvas with a black translucent backdrop; bottom navigation uses a translucent dark film.

**The Grouping Rule.** Carry the wallet’s warm totals surface into the profit summary; group other content with flat surface tone, spacing and separators.

## Shapes

Controls, period selectors and fields use the recurring gently rounded lg shape; summary, collections and dialogs use xl. Rows remain flat with hairline boundaries. Selected choices use a gold border and warm dark fill. Preserve rounded grouped controls from the incumbent interface.

## Components

### Buttons

Gold primary and dark secondary buttons use semibold centered labels, 14 dp vertical and 16 dp horizontal padding, and minimum 48 dp height. Pressed and disabled Shop buttons dim to 0.55 opacity. Native press states apply; desktop hover is not part of the mobile source.

### Chips / Choices

Period selection is a grouped surface control. Product/customer choices have a separator border and 14 dp padding; selection switches the border to gold and the fill to gold-highlight. Minimum height is 48 dp.

### Cards / Containers

Summary and collection panels are flat grouped1 surfaces with xl corners. Summary padding is 20 dp; collection padding is 18 dp. Preserve spacing and the amount hierarchy instead of adding ornamental depth.

### Inputs / Fields

Fields use grouped1 fill, lg corners, 16 dp text, 12 dp vertical and 14 dp horizontal padding, and minimum 52 dp height. Labels and placeholder text use secondary label tone. Errors use spending red. No custom input focus border is present in the source.

### Navigation

Five bottom tabs use inline stroke icons, white selected labels and a small white selected dot. Inactive content uses nav-inactive tone. Tabs have minimum 48 dp height and dim to 0.6 opacity when pressed. Shop section navigation reuses the app’s shared segmented control with white selected text, raised selected surface and 48 dp touch targets. Help and tool destinations use Settings-style grouped rows with small tinted icons.

### Ledger Summary

Profit receives the strongest numeric emphasis. Supporting rows explain sales, stock cost and expenses; collections and unpaid amounts retain separate labels. Tabular numerals keep changing amounts readable.

## Do's and Don'ts

### Do:

- **Do** preserve platform system text through AppText unless a component explicitly opts into a named font.
- **Do** provide Android Back handling, safe-area and keyboard clearance in Shop forms.
- **Do** keep Shop controls at least 48 dp tall and explicitly enable text scaling.
- **Do** allow financial rows and section headers to wrap when space is tight.

### Don't:

- **Don't** force the theme's available Poppins fonts into the system-text wrapper.
- **Don't** collapse profit, collections and customer balances into one unexplained total.
- **Don't** add decorative shadows to the flat ledger surfaces.

Shop daily totals keeps the calculation collapsed behind Details. Recording actions have their own short label; money received and customer debt use separate labelled rows with direct customer navigation. Recent activity previews three entries, with the complete ledger available through View all.
