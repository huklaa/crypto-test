const BASE_GAS_PRICE_ORACLE = "0x420000000000000000000000000000000000000F";

function toNonNegativeBigInt(value, name) {
  let result;

  if (typeof value === "bigint") {
    result = value;
  } else if (typeof value === "number" && Number.isSafeInteger(value)) {
    result = BigInt(value);
  } else if (typeof value === "string" && /^(?:0x[0-9a-f]+|[0-9]+)$/i.test(value)) {
    result = BigInt(value);
  } else {
    throw new TypeError(`${name} must be a non-negative bigint, safe integer, decimal string, or hex quantity`);
  }

  if (result < 0n) {
    throw new RangeError(`${name} must be non-negative`);
  }
  return result;
}

export function calculateBaseExecutionFee({ gasUsed, effectiveGasPrice }) {
  return toNonNegativeBigInt(gasUsed, "gasUsed") * toNonNegativeBigInt(effectiveGasPrice, "effectiveGasPrice");
}

export function calculateBaseTransactionFee({ gasUsed, effectiveGasPrice, l1Fee = 0n }) {
  const executionFeeWei = calculateBaseExecutionFee({ gasUsed, effectiveGasPrice });
  const l1FeeWei = toNonNegativeBigInt(l1Fee, "l1Fee");

  return {
    executionFeeWei,
    l1FeeWei,
    totalFeeWei: executionFeeWei + l1FeeWei,
  };
}

export function calculateBaseReceiptExecutionFee(receipt) {
  if (receipt === null || typeof receipt !== "object" || Array.isArray(receipt)) {
    throw new TypeError("receipt must be an object");
  }
  if (receipt.gasUsed === undefined || receipt.effectiveGasPrice === undefined) {
    throw new TypeError("receipt must include gasUsed and effectiveGasPrice");
  }

  return calculateBaseExecutionFee({
    gasUsed: receipt.gasUsed,
    effectiveGasPrice: receipt.effectiveGasPrice,
  });
}

export { BASE_GAS_PRICE_ORACLE };
