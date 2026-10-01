import SQLite from 'react-native-sqlite-storage';

// Configure the shared native library once, even with separate ledger databases.
SQLite.enablePromise(true);

export default SQLite;
