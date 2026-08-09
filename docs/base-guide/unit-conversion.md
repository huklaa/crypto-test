# Unit conversion

Keep human-readable decimal amounts separate from integer values sent to contracts. Parse user input with the token's configured decimals and format returned integer values only when presenting them.

Avoid JavaScript floating-point arithmetic for on-chain amounts. Use integer or big-number helpers end to end so precision is preserved.
