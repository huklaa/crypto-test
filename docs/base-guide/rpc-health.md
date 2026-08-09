# RPC health checks

Treat RPC connectivity as a dependency that should be checked explicitly. A lightweight health check can request the chain identifier and latest block number before a longer script starts.

If the RPC is unavailable, retry with bounded backoff and surface the provider error instead of silently continuing. This makes CI failures and local debugging much easier to diagnose.
