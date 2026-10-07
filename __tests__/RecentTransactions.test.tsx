import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { RecentTransactions } from '../src/components/RecentTransactions';
import { Transaction } from '../src/models';
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));
const transaction: Transaction = {
  id: 't',
  accountId: 'a',
  bankId: 'cbe',
  bankName: 'CBE',
  type: 'debit',
  amount: 100,
  balanceAfter: 500,
  date: '2026-10-07T10:00:00.000Z',
  rawSms: 'Paid ETB 100',
  hash: 'hash',
  currency: 'ETB',
  sender: 'CBE',
};
let renderer: TestRenderer.ReactTestRenderer;
afterEach(async () => {
  if (renderer) await act(async () => renderer.unmount());
});
async function edit() {
  const row = renderer.root
    .findAll(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function',
    )
    .find(node =>
      node.props.accessibilityLabel?.startsWith('Edit reason for'),
    )!;
  await act(async () => row.props.onPress());
}
async function setReason(text: string) {
  const input = renderer.root
    .findAllByProps({ accessibilityLabel: 'Reason' })
    .find(node => typeof node.props.onChangeText === 'function')!;
  await act(async () => input.props.onChangeText(text));
}
async function press(label: string) {
  const button = renderer.root
    .findAll(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function',
    )
    .find(
      node => node.findAll(child => child.props.children === label).length > 0,
    )!;
  await act(async () => button.props.onPress());
}
test('edits only a reason and allows clearing it without changing SMS-derived amounts', async () => {
  const save = jest.fn(async () => {});
  await act(async () => {
    renderer = TestRenderer.create(
      <RecentTransactions
        transactions={[{ ...transaction, reason: 'Lunch' }]}
        onSave={save}
      />,
    );
  });
  expect(
    renderer.root.findAllByProps({
      accessibilityLabel: 'Edit reason for CBE, ETB 100.00',
    }).length,
  ).toBeGreaterThan(0);
  await edit();
  await setReason('Shop rent');
  await press('Save reason');
  expect(save).toHaveBeenCalledWith('hash', 'Shop rent');
  expect(transaction.amount).toBe(100);
  await edit();
  await setReason('');
  await press('Save reason');
  expect(save).toHaveBeenLastCalledWith('hash', '');
});
test('keeps the draft on save failure and does not save on cancellation', async () => {
  const save = jest.fn(async () => {
    throw new Error('Disk');
  });
  await act(async () => {
    renderer = TestRenderer.create(
      <RecentTransactions transactions={[transaction]} onSave={save} />,
    );
  });
  await edit();
  await setReason('Bus fare');
  await press('Save reason');
  expect(
    renderer.root.findAllByProps({ value: 'Bus fare' }).length,
  ).toBeGreaterThan(0);
  await press('Cancel');
  expect(save).toHaveBeenCalledTimes(1);
});
