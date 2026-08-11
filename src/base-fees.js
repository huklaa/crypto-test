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

export function calculateBaseOperatorFee({
  gasUsed,
  operatorFeeScalar,
  operatorFeeConstant = 0n,
  hardfork = "jovian",
  isDeposit = false,
}) {
  if (typeof isDeposit !== "boolean") {
    throw new TypeError("isDeposit must be a boolean");
  }
  if (isDeposit) return 0n;
  if (hardfork !== "isthmus" && hardfork !== "jovian") {
    throw new TypeError("hardfork must be 'isthmus' or 'jovian'");
  }

  const gas = toNonNegativeBigInt(gasUsed, "gasUsed");
  const scalar = toNonNegativeBigInt(operatorFeeScalar, "operatorFeeScalar");
  const constant = toNonNegativeBigInt(operatorFeeConstant, "operatorFeeConstant");

  if (hardfork === "isthmus") {
    return (gas * scalar) / 1_000_000n + constant;
  }

  return gas * scalar * 100n + constant;
}

export function calculateBaseTransactionFee({ gasUsed, effectiveGasPrice, l1Fee = 0n, operatorFee = 0n }) {
  const executionFeeWei = calculateBaseExecutionFee({ gasUsed, effectiveGasPrice });
  const l1FeeWei = toNonNegativeBigInt(l1Fee, "l1Fee");
  const operatorFeeWei = toNonNegativeBigInt(operatorFee, "operatorFee");

  return {
    executionFeeWei,
    l1FeeWei,
    operatorFeeWei,
    totalFeeWei: executionFeeWei + l1FeeWei + operatorFeeWei,
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
