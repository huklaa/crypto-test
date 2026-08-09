# Event logs

Use events for observable state transitions that off-chain tools need to track. Include enough indexed data to filter useful records without duplicating large amounts of storage data.

When consuming logs, scope queries by contract and block range, handle duplicate processing safely, and store the last confirmed block separately from transient head state.
