import { ParsedSms, BankId } from '../models';

function parseAmount(value: string): number {
  return Number(value.replace(/,/g, ''));
}

function normalizeSender(sender: string): string {
  return sender.replace(/\s+/g, '').trim().toLowerCase();
}

type BankMatcher = {
  bankId: BankId;
  bankName: string;
  senderValues: string[];
};

let CUSTOM_BANKS: BankMatcher[] = [];

export function setCustomBanks(
  banks: Array<{ bankId: string; bankName: string; senderId: string }>,
) {
  CUSTOM_BANKS = banks.map(bank => ({
    bankId: bank.bankId as BankId,
    bankName: bank.bankName,
    senderValues: [bank.senderId.toLowerCase()],
  }));
}

const BANK_MATCHERS: BankMatcher[] = [
  {
    bankId: 'boa',
    bankName: 'BOA',
    senderValues: ['boa'],
  },
  {
    bankId: 'telebirr',
    bankName: 'Telebirr',
    senderValues: ['127'],
  },
  {
    bankId: 'cbebirr',
    bankName: 'CBEBirr',
    senderValues: ['cbebirr'],
  },
  {
    bankId: 'cbe',
    bankName: 'CBE',
    senderValues: ['cbe'],
  },
  {
    bankId: 'dashen',
    bankName: 'DashenBank',
    senderValues: ['dashenbank', 'dashen'],
  },
  {
    bankId: 'awash',
    bankName: 'AwashBank',
    senderValues: ['awash', 'awashbank', 'awashinternationalbank'],
  },
  {
    bankId: 'wegagen',
    bankName: 'WegagenBank',
    senderValues: ['wegagenbank', 'wegagen'],
  },
  {
    bankId: 'hibret',
    bankName: 'HibretBank',
    senderValues: ['hibretbank', 'hibret'],
  },
  {
    bankId: 'abay',
    bankName: 'AbayBank',
    senderValues: ['abay', 'abaybank'],
  },
  {
    bankId: 'ahadu',
    bankName: 'AhaduBank',
    senderValues: ['ahadu', 'ahadubank'],
  },
  {
    bankId: 'amhara',
    bankName: 'AmharaBank',
    senderValues: ['amhara', 'amharabank'],
  },
  {
    bankId: 'berhan',
    bankName: 'BerhanBank',
    senderValues: ['berhan', 'berhanbank', 'berhaninternationalbank'],
  },
  {
    bankId: 'mpesa',
    bankName: 'M-Pesa',
    senderValues: ['mpesa'],
  },
  {
    bankId: 'nib',
    bankName: 'NibBank',
    senderValues: ['nib', 'nibbank', 'nibinternationalbank'],
  },
  {
    bankId: 'zemen',
    bankName: 'ZemenBank',
    senderValues: ['zemen', 'zemenbank'],
  },
];

function detectBank(sender: string): {
  bankId: BankId;
  bankName: string;
} {
  const normalizedSender = normalizeSender(sender);

  // Check custom banks first
  for (const matcher of CUSTOM_BANKS) {
    if (matcher.senderValues.includes(normalizedSender)) {
      return {
        bankId: matcher.bankId,
        bankName: matcher.bankName,
      };
    }
  }

  // Check default banks
  for (const matcher of BANK_MATCHERS) {
    if (matcher.senderValues.includes(normalizedSender)) {
      return {
        bankId: matcher.bankId,
        bankName: matcher.bankName,
      };
    }
  }

  return {
    bankId: 'unknown',
    bankName: sender || 'Unknown Bank',
  };
}

function detectTransactionType(message: string): 'credit' | 'debit' | null {
  if (
    /\b(credited|deposit|deposited|received|cash\s?in|cashin|recharged|top\s?up)\b/i.test(
      message,
    )
  ) {
    return 'credit';
  }

  if (
    /\b(debited|purchase|transfer|transferred|withdrawal|withdrawn|cash\s?out|cashout|paid|payment|sent)\b/i.test(
      message,
    )
  ) {
    return 'debit';
  }

  return null;
}

function extractAmount(
  message: string,
  type: 'credit' | 'debit',
): number | null {
  const directionalPatterns =
    type === 'credit'
      ? [
          /\bcredited(?:\s+with)?[^\dA-Z]*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
          /\breceived[^\dA-Z]*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
          /\bdeposit(?:ed)?[^\dA-Z]*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
          /\bcash\s?in[^\dA-Z]*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
          /\btop\s?up[^\dA-Z]*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
        ]
      : [
          /\bdebited[^\dA-Z]*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
          /\bpurchase[^\dA-Z]*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
          /\bpayment[^\dA-Z]*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
          /\bpaid[^\dA-Z]*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
          /\btransfer(?:red)?[^\dA-Z]*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
          /\bwithdraw(?:al|n)?[^\dA-Z]*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
          /\bcash\s?out[^\dA-Z]*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
          /\bsent[^\dA-Z]*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
        ];

  for (const pattern of directionalPatterns) {
    const match = message.match(pattern);
    if (match) {
      return parseAmount(match[1]);
    }
  }

  const fallbackPatterns = [
    /\bamount[^\dA-Z]*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /\b(?:ETB|Birr|Br\.?)\s*([\d,]+(?:\.\d{1,2})?)/i,
  ];

  for (const pattern of fallbackPatterns) {
    const match = message.match(pattern);
    if (match) {
      return parseAmount(match[1]);
    }
  }

  return null;
}

function extractBalance(message: string): number | null {
  const balancePatterns = [
    /\bavailable\s+balance(?:\s+is|:)?\s*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /\bcurrent\s+balance(?:\s+is|:)?\s*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /\bnew\s+balance(?:\s+is|:)?\s*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /\bbalance(?:\s+is|:)?\s*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /\bavl\.?\s*bal(?:ance)?(?:\s+is|:)?\s*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /\bbal(?:ance)?(?:\s+is|:)?\s*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ];

  for (const pattern of balancePatterns) {
    const match = message.match(pattern);
    if (match) {
      return parseAmount(match[1]);
    }
  }

  return null;
}

// Only explicit owner-account labels identify an account. Unlabelled numbers
// and masked references can belong to recipients, phones or transaction IDs.
export function extractAccountNumberHint(message: string): string | null {
  const pattern =
    /\b(?:acct\.?|account|a\/c|wallet)\s*(?:no\.?|number|id|#)?\s*(?:ending\s+(?:in|with)|is)?\s*[:=-]?\s*((?:\d{0,16}[*xX•●#]{1,16}\s*\d{2,16})|(?:\d(?:[ -]?\d){1,17}))(?![\d*xX•●#-])/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(message)) !== null) {
    const before = message.slice(0, match.index);
    // "to account", "recipient account", etc. identify the other party.
    if (
      /(?:\bto|\bfrom|recipient(?:'s)?|beneficiary(?:'s)?|receiver(?:'s)?|sender(?:'s)?)\s*(?:(?:bank|wallet)\s+)?$/i.test(
        before,
      )
    )
      continue;
    const value = match[1].replace(/[\s-]/g, '');
    if (/[*xX•●#]/.test(value)) {
      const tail = value.match(/\d+$/)?.[0];
      return tail && tail.length >= 2 ? `****${tail}` : null;
    }
    return value;
  }
  return null;
}

export function parseGenericSms(
  message: string,
  sender = 'Unknown',
): ParsedSms | null {
  const normalized = message.trim();
  const detectedBank = detectBank(sender);
  // Unknown senders must be explicitly added as a custom bank first.
  if (detectedBank.bankId === 'unknown') return null;

  const type = detectTransactionType(normalized);
  if (!type) {
    return null;
  }

  const amount = extractAmount(normalized, type);
  if (!amount) {
    return null;
  }

  const balance = extractBalance(normalized);
  const confidence: 'high' | 'medium' | 'low' =
    balance != null ? 'high' : 'medium';

  return {
    bankId: detectedBank.bankId,
    bankName: detectedBank.bankName,
    sender,
    type,
    amount,
    balance,
    date: new Date().toISOString(),
    currency: 'ETB',
    confidence,
    accountNumberHint: extractAccountNumberHint(normalized),
    rawMessage: normalized,
  };
}
