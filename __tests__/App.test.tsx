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
  getAppLanguageFromDb: jest.fn(async () => 'en'),
  setAppLanguageInDb: jest.fn(async () => undefined),
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
      renderer.root.findAll(node => node.props.children === 'Your shop notebook')
        .length,
    ).toBeGreaterThan(0);
  } finally {
    if (renderer)
      await act(async () => {
        renderer.unmount();
      });
  }
});

test('switches the whole app, retains Amharic on reopening, and returns to English', async () => {
  const { getAppLanguageFromDb, setAppLanguageInDb } = require('../src/db');
  const { setLanguage } = require('../src/i18n');
  let saved = 'en';
  getAppLanguageFromDb.mockImplementation(async () => saved);
  setAppLanguageInDb.mockImplementation(async (value: string) => {
    saved = value;
  });
  let renderer!: TestRenderer.ReactTestRenderer;
  const press = async (label: string) => {
    const node = renderer.root
      .findAllByProps({ accessibilityLabel: label })
      .find(item => typeof item.props.onPress === 'function');
    expect(node).toBeDefined();
    await act(async () => {
      node!.props.onPress();
    });
  };
  try {
    await act(async () => {
      renderer = TestRenderer.create(<App />);
    });
    await press('Settings');
    await press('አማርኛ');
    expect(saved).toBe('am');
    expect(
      renderer.root.findAll(node => node.props.children === 'ቅንብሮች').length,
    ).toBeGreaterThan(0);
    await press('ሱቅ');
    expect(
      renderer.root.findAll(node => node.props.children === 'የሱቅ ማስታወሻዎ')
        .length,
    ).toBeGreaterThan(0);
    await act(async () => {
      renderer.unmount();
      setLanguage('en');
    });
    await act(async () => {
      renderer = TestRenderer.create(<App />);
    });
    await press('ቅንብሮች');
    await press('English');
    expect(saved).toBe('en');
    expect(
      renderer.root.findAll(node => node.props.children === 'Settings').length,
    ).toBeGreaterThan(0);
  } finally {
    await act(async () => {
      renderer.unmount();
      setLanguage('en');
    });
    getAppLanguageFromDb.mockImplementation(async () => 'en');
  }
});

test('keeps the selected language when saving a new language fails', async () => {
  const { setAppLanguageInDb } = require('../src/db');
  const { getLanguage } = require('../src/i18n');
  const { Alert } = require('react-native');
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  setAppLanguageInDb.mockRejectedValueOnce(new Error('Disk unavailable'));
  let renderer!: TestRenderer.ReactTestRenderer;
  try {
    await act(async () => {
      renderer = TestRenderer.create(<App />);
    });
    const settings = renderer.root
      .findAllByProps({ accessibilityLabel: 'Settings' })
      .find(node => typeof node.props.onPress === 'function')!;
    await act(async () => {
      settings.props.onPress();
    });
    const amharic = renderer.root
      .findAllByProps({ accessibilityLabel: 'አማርኛ' })
      .find(node => typeof node.props.onPress === 'function')!;
    await act(async () => {
      amharic.props.onPress();
    });
    expect(getLanguage()).toBe('en');
    expect(alert).toHaveBeenCalledWith(
      'Error',
      'Could not save your language. Try again.',
    );
  } finally {
    await act(async () => {
      renderer.unmount();
    });
    alert.mockRestore();
  }
});
