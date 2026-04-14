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
    senderValues: ['dashenbank'],
  },
  {
    bankId: 'awash',
    bankName: 'AwashBank',
    senderValues: ['awash', 'awashbank'],
  },
  {
    bankId: 'wegagen',
    bankName: 'WegagenBank',
    senderValues: ['wegagenbank'],
  },
];

function detectBank(sender: string): {
  bankId: BankId;
  bankName: string;
} {
  const normalizedSender = normalizeSender(sender);

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
    /\b(debited|purchase|transfer|withdrawal|withdrawn|cash\s?out|cashout|paid|payment|sent)\b/i.test(
      message,
    )
  ) {
    return 'debit';
  }

  return null;
}

function extractAmount(message: string, type: 'credit' | 'debit'): number | null {
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

export function parseGenericSms(
  message: string,
  sender = 'Unknown',
): ParsedSms | null {
  const normalized = message.trim();
  const detectedBank = detectBank(sender);

  if (detectedBank.bankId === 'unknown') {
    return null;
  }

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
    rawMessage: normalized,
  };
}
