import { TransactionType } from '../models';

/**
 * Calculate new balance based on transaction type and amount
 * @param currentBalance Current account balance
 * @param transactionType Type of transaction (credit or debit)
 * @param amount Transaction amount
 * @returns New balance after transaction
 */
export function calculateBalance(
  currentBalance: number,
  transactionType: TransactionType,
  amount: number
): number {
  if (transactionType === 'credit') {
    return currentBalance + amount;
  } else if (transactionType === 'debit') {
    return currentBalance - amount;
  }

  return currentBalance;
}

/**
 * Generate a hash for SMS deduplication
 * @param message SMS message body
 * @param sender SMS sender
 * @param timestamp SMS timestamp
 * @returns Hash string for deduplication
 */
export function generateSmsHash(message: string, sender: string, timestamp: number): string {
  // Simple hash function for deduplication
  const str = `${sender}:${message}:${timestamp}`;
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}

/**
 * Check if two SMS messages are likely duplicates
 * @param message1 First SMS message
 * @param message2 Second SMS message
 * @param timeDifferenceMs Time difference in milliseconds
 * @returns True if messages are likely duplicates
 */
export function isLikelyDuplicate(
  message1: string,
  message2: string,
  timeDifferenceMs: number
): boolean {
  // Messages are duplicates if:
  // 1. They have the same content (ignoring whitespace)
  // 2. They were received within 5 seconds of each other
  
  const normalized1 = message1.replace(/\s+/g, ' ').trim();
  const normalized2 = message2.replace(/\s+/g, ' ').trim();

  return normalized1 === normalized2 && timeDifferenceMs < 5000;
}
