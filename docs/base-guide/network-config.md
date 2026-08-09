# Network configuration

Keep chain-specific values in configuration rather than scattering them through application code. Read RPC URLs and optional explorer endpoints from environment variables, validate required values at startup, and fail with a clear message when configuration is incomplete.

For examples, keep local development and public-network settings separate so a test command cannot accidentally target a live environment.
