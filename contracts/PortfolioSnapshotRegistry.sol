// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title PortfolioSnapshotRegistry
/// @notice Stores a compact, user-owned proof of an offchain portfolio calculation.
/// @dev The contract never holds funds and only the caller can update their snapshot.
contract PortfolioSnapshotRegistry {
    struct PortfolioSnapshot {
        bytes32 portfolioHash;
        uint128 totalValueCents;
        uint16 assetCount;
        uint64 recordedAt;
    }

    mapping(address account => PortfolioSnapshot snapshot) public latestSnapshots;
    mapping(address account => uint256 count) public snapshotCount;

    error EmptyPortfolioHash();
    error EmptyPortfolio();
    error TotalValueTooLarge();

    event PortfolioSnapshotRecorded(
        address indexed account,
        bytes32 indexed portfolioHash,
        uint256 totalValueCents,
        uint256 assetCount,
        uint256 recordedAt
    );

    /// @notice Records the latest deterministic portfolio hash for the caller.
    /// @param portfolioHash Keccak-256 hash of the canonical offchain snapshot payload.
    /// @param totalValueCents Rounded portfolio value in USD cents.
    /// @param assetCount Number of assets included in the snapshot.
    function recordSnapshot(bytes32 portfolioHash, uint256 totalValueCents, uint16 assetCount) external {
        if (portfolioHash == bytes32(0)) revert EmptyPortfolioHash();
        if (assetCount == 0) revert EmptyPortfolio();
        if (totalValueCents > type(uint128).max) revert TotalValueTooLarge();

        uint64 recordedAt = uint64(block.timestamp);
        latestSnapshots[msg.sender] = PortfolioSnapshot({
            portfolioHash: portfolioHash,
            totalValueCents: uint128(totalValueCents),
            assetCount: assetCount,
            recordedAt: recordedAt
        });
        snapshotCount[msg.sender] += 1;

        emit PortfolioSnapshotRecorded(msg.sender, portfolioHash, totalValueCents, assetCount, recordedAt);
    }

    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}
