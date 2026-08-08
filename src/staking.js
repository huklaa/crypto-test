/**
 * Estimates simple staking rewards using a 365-day year.
 * @param {number} principal - Amount staked.
 * @param {number} annualRatePercent - Annual percentage rate.
 * @param {number} days - Staking duration in days.
 * @returns {number} Estimated reward amount.
 */
export function calculateStakingReward(principal, annualRatePercent, days) {
  if (![principal, annualRatePercent, days].every(Number.isFinite) || principal < 0 || annualRatePercent < 0 || days < 0) {
    throw new RangeError("Staking inputs cannot be negative");
  }
  return (principal * annualRatePercent * days) / (100 * 365);
}

export function calculateCompoundedStaking(principal, annualRatePercent, compoundsPerYear, years) {
  if (principal < 0 || annualRatePercent < 0 || compoundsPerYear <= 0 || years < 0) {
    throw new RangeError("Compounding inputs are invalid");
  }
  return principal * (1 + annualRatePercent / 100 / compoundsPerYear) ** (compoundsPerYear * years);
}

export function calculateAnnualizedReturn(startValue, endValue, days) {
  if (startValue <= 0 || endValue < 0 || days <= 0) throw new RangeError("Annualized return inputs are invalid");
  return ((endValue / startValue) ** (365 / days) - 1) * 100;
}

export function calculateYieldAfterFee(grossYieldPercent, platformFeePercent) {
  if (grossYieldPercent < 0 || platformFeePercent < 0 || platformFeePercent > 100) {
    throw new RangeError("Yield inputs are invalid");
  }
  return grossYieldPercent * (1 - platformFeePercent / 100);
}

export function estimateRewardTokens(stakedAmount, rewardRatePercent) {
  if (stakedAmount < 0 || rewardRatePercent < 0) throw new RangeError("Reward inputs cannot be negative");
  return (stakedAmount * rewardRatePercent) / 100;
}
