# RPC rate limits

Design scripts so they do not flood a provider with unnecessary requests. Cache immutable values, batch compatible reads when the client supports it, and avoid polling faster than the application needs.

When a provider reports rate limiting, back off rather than immediately repeating the same burst. Make request frequency configurable for CI and local development.
