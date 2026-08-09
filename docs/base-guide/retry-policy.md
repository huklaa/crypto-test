# Retry policy

Retry only failures that are likely to be transient, such as temporary RPC timeouts or rate limits. Use bounded retries with increasing delays and stop after a small number of attempts.

Do not automatically retry rejected signatures or deterministic contract reverts. Those require changed input, state, or explicit user action rather than another identical request.
