# Read calls vs write transactions

Separate read-only contract calls from state-changing transactions in both code and UI. Reads do not require signing, while writes should clearly show the action, target contract, and expected effect before a signer is invoked.

This distinction makes examples easier to audit and helps prevent accidental wallet prompts during simple data inspection.
