# App languages

In Settings → Language, choose **English** or **አማርኛ**. The selection updates the app immediately and is saved offline in the existing `user_settings` table. Reopening the app restores it before showing onboarding, the wallet or the lock screen. Existing installations default to English.

Coverage includes onboarding, navigation, wallet and bank details, transaction filters, analytics, settings and app-authored biometric prompts, plus all Shop totals, forms, activity descriptions, credit/repayment flows, validation and empty states. Dates and amounts follow `en-ET` or `am-ET`; changing language does not change reporting periods or the underlying transaction dates. This feature does not convert dates to the Ethiopian calendar.

Product/customer names, user-entered bank names, sender IDs, account numbers, SMS contents and stored category identifiers remain intact. Built-in expense/category labels translate when displayed. Android permission dialogs and system-owned biometric text follow the device language; the app translates its own prompt and cancel text.

`src/i18n/am.ts` contains Amharic translations keyed by their English source text. Use `t()` for authored copy, with named placeholders for dynamic values. Never translate user content automatically. `useLanguage()` subscribes independent components to updates; `getLocale()` formats dates and amounts. Keep category IDs and other persisted values independent of displayed labels. The bundled Nokia Pure font, normal Ethiopic letter spacing, and additional line height keep Amharic readable.

Validation: the translation catalog test checks explicit keys and interpolation tokens; app integration tests exercise switching both directions, restoration on reopening and persistence failures. Android emulator verification confirms actual saved preference restoration and Amharic rendering in Settings, Wallet, Analytics and Shop.
