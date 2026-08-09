# Gas estimation

Estimate gas before submitting state-changing transactions and treat estimation failures as useful diagnostic signals. A failed estimate can indicate a revert, missing allowance, invalid arguments, or stale state.

When adding a gas buffer, keep it modest and explicit. Avoid hard-coding very large gas limits because that can hide underlying issues and make examples less portable.
