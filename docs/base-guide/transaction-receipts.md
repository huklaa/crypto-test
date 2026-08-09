# Transaction receipts

Do not treat a submitted transaction hash as final success. Wait for the receipt and inspect its status before reporting completion to the caller.

Record the transaction hash in logs so failures can be reproduced and inspected later. For scripts that submit multiple transactions, keep each receipt associated with the action that produced it.
