import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import App from '../App';
import { loadShop } from '../src/db/shopDatabase';
jest.setTimeout(30000);

jest.mock('react-native-permissions', () => ({
  check: jest.fn(async () => 'denied'),
  request: jest.fn(async () => 'denied'),
  PERMISSIONS: { ANDROID: { READ_SMS: 'read', RECEIVE_SMS: 'receive' } },
  RESULTS: { DENIED: 'denied', GRANTED: 'granted' },
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: require('react-native').View,
  SafeAreaView: require('react-native').View,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('react-native-linear-gradient', () => require('react-native').View);
jest.mock('@react-native-community/blur', () => ({
  BlurView: require('react-native').View,
}));
jest.mock('react-native-biometrics', () =>
  jest.fn(() => ({ simplePrompt: jest.fn() })),
);
jest.mock('../src/db', () => ({
  initDatabase: jest.fn(async () => undefined),
  getUserNameFromDb: jest.fn(async () => 'Shop owner'),
  getBalanceHiddenFromDb: jest.fn(async () => false),
  getUserTitleFromDb: jest.fn(async () => null),
  getCustomBanksFromDb: jest.fn(async () => []),
  getAppLockedFromDb: jest.fn(async () => false),
  getAutoLockTimeoutFromDb: jest.fn(async () => 0),
  getAccountsFromDb: jest.fn(async () => []),
  getTransactionsFromDb: jest.fn(async () => []),
}));
jest.mock('../src/db/shopDatabase', () => ({
  loadShop: jest.fn(async () => require('../src/models/shop').EMPTY_SHOP),
}));

test('opens the offline shop ledger when SMS permission is declined', async () => {
  let renderer!: TestRenderer.ReactTestRenderer;
  try {
    await act(async () => {
      renderer = TestRenderer.create(<App />);
    });
    const shopTab = renderer.root
      .findAllByProps({ accessibilityLabel: 'Shop' })
      .find(node => typeof node.props.onPress === 'function');
    expect(shopTab).toBeDefined();
    await act(async () => {
      shopTab!.props.onPress();
    });
    expect(loadShop).toHaveBeenCalled();
    expect(
      renderer.root.findAll(node => node.props.children === 'Your daily ledger')
        .length,
    ).toBeGreaterThan(0);
  } finally {
    if (renderer)
      await act(async () => {
        renderer.unmount();
      });
  }
});
