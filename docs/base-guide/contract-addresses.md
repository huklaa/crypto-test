# Contract address handling

Keep deployed contract addresses in network-scoped configuration instead of embedding them in business logic. Validate address formatting before making calls and label each address with the network where it is valid.

When an address changes after a redeploy, update one configuration source rather than editing multiple scripts. This reduces mistakes and makes examples easier to review.
