<div align="center">
  <img src="assets/hisab.png" width="180" height="180" alt="Hisab App Icon" />
  
  # 🏦 Hisab
  
  **Your Personal Finance & Balance Tracking Companion**
  
  ![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

  <p align="center">
    <i>Secure, private, and automated financial tracking based on SMS notifications.</i>
  </p>
</div>

---

## ✨ Features

- **Automated Tracking**: Extracts transaction data from SMS messages sent by your bank.
- **100% Offline & Private**: All parsing, processing, and storage happens locally on your device. No cloud sync, no internet required.
- **Biometric Security**: Keep your financial data safe with native biometric authentication and customizable auto-lock timeouts.
- **Multi-Bank Support**: Works seamlessly with multiple banks. Easily add custom banks and SMS sender rules.
- **Beautiful UI**: Modern, sleek, dark-themed interface built with a premium touch.
- **Detailed Analytics**: Visualize your spending habits and account balances over time.

---

## 📸 Screenshots

*(Add screenshots of your beautiful UI here)*
> E.g., Dashboard, Lock Screen, Analytics, Settings.

---

## 🚀 Getting Started

### Prerequisites

- Node.js `^22.11.0`
- React Native CLI
- Android Studio & SDK (for Android development)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <repository_url>
   cd HisabApp
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Start the Metro Bundler:**
   ```sh
   npm start
   ```

4. **Run the Application:**
   Open a new terminal window and run:
   ```sh
   npm run android
   ```
   *(iOS support requires CocoaPods and Xcode setup)*

---

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: `react-native-sqlite-storage`
- **Security**: `react-native-biometrics`
- **Styling**: `react-native-linear-gradient` & `react-native-svg`

---

## 🏗️ Project Architecture

```mermaid
graph TD;
    A[SMS Receiver] -->|Raw Message| B(Parser Service);
    B -->|Transaction Data| C{SQLite Storage};
    C -->|State| D[React Native UI];
    D --> E(Dashboard);
    D --> F(Analytics);
    D --> G(Settings);
```

### Key Modules

- **`/src/db`**: Local SQLite database setup, queries, and migrations.
- **`/src/parsers`**: Logic for parsing bank SMS formats into structured `Transaction` models.
- **`/src/screens`**: React components representing the app's views.
- **`/src/models`**: TypeScript interfaces defining the core data structures (e.g., `Account`, `Transaction`).

---

## 🛡️ Privacy & Permissions

This app requires the following permissions to function:
- `READ_SMS` & `RECEIVE_SMS`: Necessary to automatically track incoming bank transactions. 
*(No SMS data ever leaves your device).*

---

## 🛣️ Roadmap

- [x] Basic UI screens (Dashboard, Bank Detail)
- [x] SMS Integration & Local Storage
- [x] Automated parsing and balance calculation
- [x] Biometric lock implementation
- [ ] iOS Support (SMS parsing via alternative means if possible)
- [ ] Export to CSV/PDF
- [ ] Budgeting and categorization

---

<div align="center">
  <i>Built with ❤️ using React Native</i>
</div>