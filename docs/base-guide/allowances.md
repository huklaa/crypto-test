# Token allowance checks

Before submitting a token transfer-from workflow, read the current allowance and compare it with the required amount. Avoid asking for a new approval when the existing allowance is already sufficient.

For user-facing flows, show the spender address and requested allowance clearly. Prefer the smallest practical authorization instead of defaulting to unlimited approval in examples.
