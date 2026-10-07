import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ShopScreen } from '../src/screens/ShopScreen';
import { EMPTY_SHOP } from '../src/models/shop';
import { addCustomer, loadShop, recordSale } from '../src/db/shopDatabase';
jest.setTimeout(30000);
jest.mock('react-native-linear-gradient', () => require('react-native').View);

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('../src/db/shopDatabase', () => ({
  loadShop: jest.fn(),
  addCustomer: jest.fn(),
  recordSale: jest.fn(),
}));
const mockLoad = loadShop as jest.Mock;
const mockAddCustomer = addCustomer as jest.Mock;
const mockRecordSale = recordSale as jest.Mock;
const product = {
  id: 'p',
  name: 'Coffee',
  unit: 'packs',
  quantity: 10,
  costCents: 5000,
  priceCents: 8000,
  lowStock: 2,
};
let activeRenderer: TestRenderer.ReactTestRenderer | null = null;
afterEach(async () => {
  if (activeRenderer)
    await act(async () => {
      activeRenderer!.unmount();
    });
  activeRenderer = null;
});
function press(renderer: TestRenderer.ReactTestRenderer, label: string) {
  const button = renderer.root
    .findAll(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function',
    )
    .find(
      node => node.findAll(child => child.props.children === label).length > 0,
    );
  if (!button) throw new Error(`Missing button: ${label}`);
  button.props.onPress();
}
function field(
  renderer: TestRenderer.ReactTestRenderer,
  label: string,
  value: string,
) {
  renderer.root
    .findAllByProps({ accessibilityLabel: label })
    .find(node => typeof node.props.onChangeText === 'function')!
    .props.onChangeText(value);
}
test('keeps a sale draft when adding its first credit customer and records a partial payment', async () => {
  mockLoad.mockResolvedValue({ ...EMPTY_SHOP, products: [product] });
  mockAddCustomer.mockResolvedValue('customer-1');
  mockRecordSale.mockResolvedValue(undefined);
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(<ShopScreen />);
    activeRenderer = renderer;
  });
  await act(async () => {
    press(renderer, '＋ Record sale');
  });
  await act(async () => {
    press(renderer, 'Coffee');
  });
  await act(async () => {
    field(renderer, 'How many are you selling?', '2');
  });
  await act(async () => {
    press(renderer, 'Add to sale');
  });
  await act(async () => {
    field(renderer, 'How much did the customer pay? (ETB)', '60');
    press(renderer, '＋ New customer');
  });
  await act(async () => {
    field(renderer, 'New customer name', 'Abebe');
    field(renderer, 'Phone (optional)', '0912345678');
  });
  await act(async () => {
    press(renderer, 'Save customer & keep sale');
  });
  expect(mockAddCustomer).toHaveBeenCalledWith('Abebe', '0912345678');
  await act(async () => {
    press(renderer, 'Save sale');
  });
  expect(mockRecordSale).toHaveBeenCalledWith(
    [{ productId: 'p', quantity: 2, priceCents: 8000 }],
    6000,
    'customer-1',
  );
});

test('a new owner can find the guide and start adding their first product', async () => {
  mockLoad.mockResolvedValue(EMPTY_SHOP);
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(<ShopScreen />);
    activeRenderer = renderer;
  });
  const guide = () =>
    renderer.root
      .findAllByProps({ accessibilityLabel: 'How to use Shop' })
      .find(node => typeof node.props.onPress === 'function')!;
  expect(guide().props.accessibilityState.expanded).toBe(false);
  await act(async () => {
    guide().props.onPress();
  });
  expect(guide().props.accessibilityState.expanded).toBe(true);
  expect(
    renderer.root.findAll(
      node => node.props.children === '2. Write down each sale',
    ).length,
  ).toBeGreaterThan(0);
  await act(async () => {
    guide().props.onPress();
  });
  await act(async () => {
    press(renderer, 'Add your first product');
  });
  expect(
    renderer.root.findAllByProps({
      accessibilityLabel: 'How many do you have now?',
    }).length,
  ).toBeGreaterThan(0);
  expect(
    renderer.root.findAllByProps({
      accessibilityLabel: 'What did one cost you? (ETB)',
    }).length,
  ).toBeGreaterThan(0);
});

test('opens the new shop tools and shares a daily closing summary', async () => {
  const { Share } = require('react-native');
  const shared = jest
    .spyOn(Share, 'share')
    .mockResolvedValue({ action: 'sharedAction' });
  mockLoad.mockResolvedValue(EMPTY_SHOP);
  let renderer!: TestRenderer.ReactTestRenderer;
  try {
    await act(async () => {
      renderer = TestRenderer.create(<ShopScreen />);
      activeRenderer = renderer;
    });
    await act(async () => press(renderer, 'More shop tools'));
    for (const label of [
      'Returns',
      'Stock corrections',
      'Daily closing summary',
      'Customer statements',
      'Suppliers & debts',
    ]) {
      expect(
        renderer.root.findAll(node => node.props.children === label).length,
      ).toBeGreaterThan(0);
    }
    await act(async () => press(renderer, 'Daily closing summary'));
    await act(async () => press(renderer, 'Share daily summary'));
    expect(shared).toHaveBeenCalledWith({
      message: expect.stringContaining('Money received after refunds'),
    });
  } finally {
    shared.mockRestore();
  }
});

test('keeps profit details collapsed and opens customer debts from the money overview', async () => {
  mockLoad.mockResolvedValue({
    ...EMPTY_SHOP,
    products: [product],
    customers: [{ id: 'c', name: 'Abebe', phone: '' }],
    sales: [
      {
        id: 's',
        customerId: 'c',
        date: new Date().toISOString(),
        totalCents: 8000,
        costCents: 5000,
      },
    ],
    lines: [
      {
        id: 'l',
        saleId: 's',
        productId: product.id,
        name: product.name,
        unit: product.unit,
        quantity: 1,
        priceCents: 8000,
        costCents: 5000,
      },
    ],
  });
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(<ShopScreen />);
    activeRenderer = renderer;
  });
  const details = () =>
    renderer.root.findAll(
      node => node.props.children === 'What sold items cost you',
    );
  expect(details()).toHaveLength(0);
  await act(async () => press(renderer, 'Details'));
  expect(details().length).toBeGreaterThan(0);
  await act(async () => press(renderer, 'Hide details'));
  expect(details()).toHaveLength(0);
  const debts = renderer.root
    .findAllByProps({ accessibilityLabel: 'View customer debts' })
    .find(node => typeof node.props.onPress === 'function')!;
  await act(async () => debts.props.onPress());
  expect(
    renderer.root.findAll(node => node.props.children === 'Abebe').length,
  ).toBeGreaterThan(0);
});

test('confirms discard inside the app and keeps the draft when editing continues or Back is pressed', async () => {
  mockLoad.mockResolvedValue({ ...EMPTY_SHOP, products: [product] });
  mockRecordSale.mockClear();
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(<ShopScreen />);
    activeRenderer = renderer;
  });
  await act(async () => press(renderer, '＋ Record sale'));
  await act(async () => press(renderer, 'Coffee'));
  await act(async () => field(renderer, 'How many are you selling?', '2'));
  await act(async () => press(renderer, 'Add to sale'));
  await act(async () => press(renderer, 'Cancel'));
  expect(
    renderer.root.findAll(node => node.props.children === 'Discard this sale?')
      .length,
  ).toBeGreaterThan(0);
  await act(async () => press(renderer, 'Keep editing'));
  expect(
    renderer.root.findAll(node => node.props.children === 'Discard this sale?'),
  ).toHaveLength(0);
  expect(
    renderer.root.findAll(node => node.props.children === 'ETB 160.00').length,
  ).toBeGreaterThan(0);
  await act(async () => press(renderer, 'Cancel'));
  const confirmation = renderer.root.findAll(
    node =>
      node.props.transparent === true &&
      node.props.visible === true &&
      typeof node.props.onRequestClose === 'function',
  )[0];
  await act(async () => confirmation.props.onRequestClose());
  expect(
    renderer.root.findAll(node => node.props.children === 'Discard this sale?'),
  ).toHaveLength(0);
  await act(async () => press(renderer, 'Cancel'));
  await act(async () => press(renderer, 'Discard sale'));
  expect(
    renderer.root.findAll(node => node.props.children === 'Save sale'),
  ).toHaveLength(0);
  expect(mockRecordSale).not.toHaveBeenCalled();
});
