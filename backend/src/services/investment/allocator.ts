/**
 * Stable investment allocator - government bonds, post office, fixed deposits.
 * No volatile markets. Positive portfolio focus.
 */

export type InstrumentType = "government_bond" | "post_office" | "fixed_deposit" | "sovereign_fund";

export interface Instrument {
  type: InstrumentType;
  name: string;
  expectedReturn: number;
  minAmount: number;
  weight: number; // allocation weight 0-1
}

const STABLE_INSTRUMENTS: Instrument[] = [
  { type: "government_bond", name: "Government Securities (G-Sec)", expectedReturn: 7.1, minAmount: 1000, weight: 0.3 },
  { type: "post_office", name: "Post Office PPF", expectedReturn: 7.1, minAmount: 500, weight: 0.25 },
  { type: "post_office", name: "Post Office NSC", expectedReturn: 7.0, minAmount: 1000, weight: 0.2 },
  { type: "fixed_deposit", name: "Bank Fixed Deposit", expectedReturn: 6.5, minAmount: 1000, weight: 0.15 },
  { type: "sovereign_fund", name: "Sovereign Gold Bond", expectedReturn: 2.5, minAmount: 1000, weight: 0.1 },
];

export interface AllocationResult {
  instrumentType: InstrumentType;
  instrumentName: string;
  amount: number;
  expectedReturn: number;
}

export function allocateStable(amount: number): AllocationResult[] {
  const results: AllocationResult[] = [];
  let remaining = amount;

  for (const inst of STABLE_INSTRUMENTS) {
    const allocAmount = Math.min(remaining, Math.max(inst.minAmount, Math.round(amount * inst.weight)));
    if (allocAmount >= inst.minAmount) {
      results.push({
        instrumentType: inst.type,
        instrumentName: inst.name,
        amount: allocAmount,
        expectedReturn: inst.expectedReturn,
      });
      remaining -= allocAmount;
    }
    if (remaining <= 0) break;
  }

  if (remaining > 0 && results.length > 0) {
    results[0].amount += remaining;
  }

  return results;
}
