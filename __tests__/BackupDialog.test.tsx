import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import { BackupDialog } from '../src/components/BackupDialog';
import { backupService } from '../src/services/backupService';
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));
jest.mock('../src/services/backupService', () => ({
  ...jest.requireActual('../src/services/backupService'),
  backupService: {
    create: jest.fn(),
    preview: jest.fn(),
    restore: jest.fn(),
    cancel: jest.fn(),
  },
}));
const service = backupService as jest.Mocked<typeof backupService>;
const preview = {
  token: 'token',
  createdAt: '2026-10-07T10:00:00.000Z',
  accounts: 2,
  transactions: 10,
  products: 3,
  customers: 1,
  sales: 4,
  expenses: 2,
  payments: 5,
};
let renderer: TestRenderer.ReactTestRenderer;
let closed: jest.Mock;
let restored: jest.Mock;
const press = async (label: string) => {
  const control = renderer.root
    .findAll(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function',
    )
    .find(
      node => node.findAll(child => child.props.children === label).length > 0,
    )!;
  expect(control).toBeDefined();
  await act(async () => control.props.onPress());
};
const input = async (label: string, value: string) => {
  const control = renderer.root
    .findAllByProps({ accessibilityLabel: label })
    .find(node => typeof node.props.onChangeText === 'function')!;
  await act(async () => control.props.onChangeText(value));
};
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(async () => {
  if (renderer) await act(async () => renderer.unmount());
  jest.restoreAllMocks();
});
async function open(mode: 'create' | 'restore') {
  closed = jest.fn();
  restored = jest.fn(async () => {});
  await act(async () => {
    renderer = TestRenderer.create(
      <BackupDialog
        mode={mode}
        onClose={closed}
        onRestored={restored}
        runOperation={operation => operation()}
      />,
    );
  });
}
test('requires a matching password before exporting', async () => {
  await open('create');
  await input('Backup password', 'short');
  await press('Choose where to save');
  expect(service.create).not.toHaveBeenCalled();
  await input('Backup password', 'long-password');
  await input('Confirm password', 'different');
  await press('Choose where to save');
  expect(service.create).not.toHaveBeenCalled();
  await input('Confirm password', 'long-password');
  service.create.mockResolvedValueOnce(true);
  await press('Choose where to save');
  expect(service.create).toHaveBeenCalledWith('long-password');
  expect(closed).toHaveBeenCalled();
});
test('previews a valid file and aborts replacement when the safety copy is cancelled', async () => {
  await open('restore');
  service.preview.mockResolvedValue(preview);
  await input('Backup password', 'long-password');
  await press('Choose backup file');
  expect(service.restore).not.toHaveBeenCalled();
  service.create.mockResolvedValueOnce(false);
  await press('Replace my records');
  expect(service.restore).not.toHaveBeenCalled();
  expect(restored).not.toHaveBeenCalled();
  service.create.mockResolvedValueOnce(true);
  service.restore.mockResolvedValueOnce(true);
  await press('Replace my records');
  expect(service.restore).toHaveBeenCalledWith('token');
  expect(restored).toHaveBeenCalled();
});
test('bad passwords and damaged files never reach restore', async () => {
  await open('restore');
  service.preview.mockRejectedValueOnce({ code: 'UNLOCK_FAILED' });
  await input('Backup password', 'wrong-password');
  await press('Choose backup file');
  expect(service.restore).not.toHaveBeenCalled();
  expect(
    renderer.root.findAll(
      node =>
        node.props.children ===
        'Could not unlock this file. Check the password; the file may also be damaged.',
    ).length,
  ).toBeGreaterThan(0);
  expect(closed).not.toHaveBeenCalled();
});
test('cancelling the file picker does not replace records or show a preview', async () => {
  await open('restore');
  service.preview.mockResolvedValueOnce(null);
  await input('Backup password', 'long-password');
  await press('Choose backup file');
  expect(service.restore).not.toHaveBeenCalled();
  expect(
    renderer.root.findAll(node => node.props.children === 'Replace my records'),
  ).toHaveLength(0);
});
