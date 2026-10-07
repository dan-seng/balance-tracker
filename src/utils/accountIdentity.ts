import { Account, ParsedSms } from '../models';

type Identity = { digits: string; masked: boolean };
function identity(value?: string | null): Identity | null {
  if (!value) return null;
  const masked = /[*xX•●#]/.test(value);
  const digits = masked
    ? value.match(/\d+$/)?.[0] ?? ''
    : value.replace(/\D/g, '');
  if (digits.length < 2) return null;
  return { digits, masked: masked || digits.length < 6 };
}
function compatible(left: Identity, right: Identity): boolean {
  if (!left.masked && !right.masked) return left.digits === right.digits;
  const shorter = left.digits.length <= right.digits.length ? left : right;
  const longer = shorter === left ? right : left;
  return shorter.masked && longer.digits.endsWith(shorter.digits);
}
export function toDisplayAccountNumber(hint?: string | null): string {
  const value = identity(hint);
  if (!value) return '•••• ••••';
  return value.masked ? `•••• ${value.digits}` : value.digits;
}

export type AccountResolution =
  | { kind: 'matched'; account: Account }
  | { kind: 'new' }
  | { kind: 'ambiguous' };

// A receiving SIM is routing metadata, not proof of a separate bank account.
// Missing account details never justify inventing another account.
export function resolveAccountForSms(
  accounts: Account[],
  parsed: ParsedSms,
  subId?: number | null,
): AccountResolution {
  const candidates = accounts.filter(
    account => account.bankId === parsed.bankId,
  );
  if (!candidates.length) return { kind: 'new' };
  const hint = identity(parsed.accountNumberHint);
  if (hint) {
    const matches = candidates.filter(account => {
      const stored = identity(account.accountNumber);
      return stored && compatible(stored, hint);
    });
    if (matches.length === 1) return { kind: 'matched', account: matches[0] };
    if (matches.length > 1) return { kind: 'ambiguous' };
    // Adopt an unlabelled placeholder when it is the only account known.
    if (candidates.length === 1 && !identity(candidates[0].accountNumber)) {
      return { kind: 'matched', account: candidates[0] };
    }
    // Explicit conflicting account numbers remain distinct, even on one SIM.
    return { kind: 'new' };
  }
  if (candidates.length === 1)
    return { kind: 'matched', account: candidates[0] };
  if (subId != null && subId >= 0) {
    const routed = candidates.filter(account => account.subId === subId);
    if (routed.length === 1) return { kind: 'matched', account: routed[0] };
  }
  // Keep an ambiguous SMS in the inbox for a future import instead of assigning
  // its money to an arbitrary account or fabricating an extra account.
  return { kind: 'ambiguous' };
}

export function applyAccountIdentity(
  account: Account,
  parsed: ParsedSms,
  subId?: number | null,
): boolean {
  let changed = false;
  if (subId != null && subId >= 0 && account.subId == null) {
    account.subId = subId;
    changed = true;
  }
  const hint = identity(parsed.accountNumberHint);
  const stored = identity(account.accountNumber);
  if (
    hint &&
    (!stored ||
      (compatible(stored, hint) &&
        ((stored.masked && !hint.masked) ||
          (stored.masked && hint.digits.length > stored.digits.length))))
  ) {
    account.accountNumber = toDisplayAccountNumber(parsed.accountNumberHint);
    changed = true;
  }
  return changed;
}
