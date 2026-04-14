export type SmsMessage = {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  accountId: string;
};

const sampleMessages: SmsMessage[] = [
  {
    id: 'sms-1',
    sender: 'CBE',
    accountId: 'cbe-main',
    message:
      'Your account has been credited with ETB 2,500.00. Your balance is ETB 15,420.25.',
    timestamp: '2026-04-14T08:30:00.000Z',
  },
  {
    id: 'sms-2',
    sender: 'CBE',
    accountId: 'cbe-main',
    message:
      'Your account has been debited ETB 320.00 for merchant payment. Your balance is ETB 15,100.25.',
    timestamp: '2026-04-14T10:10:00.000Z',
  },
  {
    id: 'sms-3',
    sender: 'CBE',
    accountId: 'cbe-main',
    message:
      'Your account has been credited with ETB 1,200.00. Your balance is ETB 16,300.25.',
    timestamp: '2026-04-14T12:45:00.000Z',
  },
  {
    id: 'sms-4',
    sender: 'Dashen',
    accountId: 'dashen-main',
    message:
      'Dashen Bank alert: Salary credited ETB 8,400.00. Available balance ETB 24,800.00.',
    timestamp: '2026-04-13T07:50:00.000Z',
  },
  {
    id: 'sms-5',
    sender: 'Dashen',
    accountId: 'dashen-main',
    message:
      'Dashen Bank alert: Purchase debited ETB 1,250.00. Available balance ETB 23,550.00.',
    timestamp: '2026-04-13T16:40:00.000Z',
  },
  {
    id: 'sms-6',
    sender: 'Awash',
    accountId: 'awash-main',
    message:
      'Awash notification: Account credited ETB 3,600.00. Current balance ETB 10,150.00.',
    timestamp: '2026-04-12T09:05:00.000Z',
  },
  {
    id: 'sms-7',
    sender: 'Awash',
    accountId: 'awash-main',
    message:
      'Awash notification: Transfer debited ETB 900.00. Current balance ETB 9,250.00.',
    timestamp: '2026-04-12T18:15:00.000Z',
  },
];

export function getSampleSmsMessages() {
  return sampleMessages;
}
