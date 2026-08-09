# ABI management

Treat ABI files as generated or versioned artifacts tied to a specific contract build. Avoid copying partial ABIs between examples because missing events or custom errors make debugging harder.

When a contract interface changes, rebuild or refresh the ABI and review the application calls that depend on it. Keep ABI updates in the same change set as the corresponding contract interface update when practical.
