# Nonce handling

For normal wallet-driven flows, let the provider or signer manage transaction nonces unless the application has a specific reason to coordinate them. Manual nonce management becomes important when sending several transactions concurrently.

If a transaction is replaced or stuck, inspect pending account state before resubmitting. Reusing or skipping nonces blindly can leave later transactions blocked behind an earlier one.
