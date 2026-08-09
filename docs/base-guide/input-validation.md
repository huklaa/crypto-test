# Input validation

Validate addresses, integer ranges, token amounts, and required fields before constructing a transaction. User-facing validation should explain which value is invalid rather than passing malformed input to the provider.

Normalize units at the boundary of the application so contract calls receive values in the expected base unit and display code can remain human-readable.
