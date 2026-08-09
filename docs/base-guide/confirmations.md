# Confirmation strategy

Choose a confirmation policy that matches the importance of the action. Local examples may only need a mined receipt, while production workflows should distinguish pending, mined, and sufficiently confirmed states.

Keep the policy configurable and avoid presenting a transaction as final before the application has reached its chosen confirmation threshold.
