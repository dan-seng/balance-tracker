import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ShopScreen } from '../src/screens/ShopScreen';
import { EMPTY_SHOP } from '../src/models/shop';
import { addCustomer, loadShop, recordSale } from '../src/db/shopDatabase';
jest.setTimeout(30000);

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
