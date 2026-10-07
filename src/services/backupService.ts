import { NativeModules } from 'react-native';
import { t } from '../i18n';

export type BackupPreview = {
  transaction_notes?: number;
  returns?: number;
  adjustments?: number;
  suppliers?: number;
  purchases?: number;
  token: string;
  createdAt: string;
  accounts: number;
  transactions: number;
  products: number;
  customers: number;
  sales: number;
  expenses: number;
  payments: number;
};
export type DataOperation = <T>(operation: () => Promise<T>) => Promise<T>;
function native() {
  const module = NativeModules.BackupModule;
  if (!module) throw { code: 'UNAVAILABLE' };
  return module;
}
export const backupService = {
  create: (password: string): Promise<boolean> =>
    native().createBackup(password),
  preview: (password: string): Promise<BackupPreview | null> =>
    native().previewRestore(password),
  restore: (token: string): Promise<boolean> => native().applyRestore(token),
  cancel: () => NativeModules.BackupModule?.cancelRestore(),
};
export function backupError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code === 'UNLOCK_FAILED')
    return t(
      'Could not unlock this file. Check the password; the file may also be damaged.',
    );
  if (code === 'INVALID_FILE')
    return t(
      'This is not a valid supported Hisab backup. Your records have not changed.',
    );
  if (code === 'PASSWORD')
    return t('Use a password with at least 8 characters.');
  if (code === 'TOO_LARGE')
    return t('This backup is too large. The file limit is 32 MB.');
  if (code === 'UNAVAILABLE')
    return t(
      'Backup needs the updated Android app. Rebuild and install it first.',
    );
  return t(
    'The backup operation could not finish. Check file access and free space, then try again.',
  );
}
