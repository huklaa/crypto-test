// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20Chainling {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

interface IERC1155ReceiverChainling {
    function onERC1155Received(address operator, address from, uint256 id, uint256 value, bytes calldata data) external returns (bytes4);
    function onERC1155BatchReceived(address operator, address from, uint256[] calldata ids, uint256[] calldata values, bytes calldata data) external returns (bytes4);
}

/// @title Chainling Early Explorer Collection
/// @notice Seven fixed-cap ERC-1155 souvenir editions sold for 0.50 USDG each on Robinhood Chain.
contract ChainlingCollection {
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values);
    event ApprovalForAll(address indexed account, address indexed operator, bool approved);
    event URI(string value, uint256 indexed id);
    event Paused(bool value);
    event BaseURIUpdated(string value);

    error InvalidDesign();
    error InvalidAmount();
    error SoldOut();
    error NotAuthorized();
    error UnsafeRecipient();
    error PaymentFailed();
    error Reentrancy();
    error MintPaused();
    error ZeroAddress();

    string public name = "Chainling Early Explorer";
    string public symbol = "CHAINLING";

    address public immutable owner;
    address public immutable treasury;
    IERC20Chainling public immutable usdg;

    // USDG uses 6 decimals. 0.50 USDG = 500,000 base units.
    uint256 public constant MINT_PRICE = 500_000;

    mapping(uint256 => mapping(address => uint256)) private _balances;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => uint256) public minted;

    string private _baseURI;
    bool public paused;
    uint256 private _locked = 1;

    constructor(address usdgAddress, address treasuryAddress, string memory baseURI_) {
        if (usdgAddress == address(0) || treasuryAddress == address(0)) revert ZeroAddress();
        owner = treasuryAddress;
        treasury = treasuryAddress;
        usdg = IERC20Chainling(usdgAddress);
        _baseURI = baseURI_;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotAuthorized();
        _;
    }

    modifier nonReentrant() {
        if (_locked != 1) revert Reentrancy();
        _locked = 2;
        _;
        _locked = 1;
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x01ffc9a7 || interfaceId == 0xd9b67a26 || interfaceId == 0x0e89341c;
    }

    function maxSupply(uint256 id) public pure returns (uint256) {
        if (id == 1) return 4_444;
        if (id == 2) return 5_555;
        if (id == 3) return 7_777;
        if (id == 4) return 6_666;
        if (id == 5) return 3_333;
        if (id == 6) return 8_888;
        if (id == 7) return 4_500;
        revert InvalidDesign();
    }

    function totalMaximumSupply() external pure returns (uint256) {
        return 41_163;
    }

    function balanceOf(address account, uint256 id) public view returns (uint256) {
        if (account == address(0)) revert ZeroAddress();
        return _balances[id][account];
    }

    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view returns (uint256[] memory values) {
        if (accounts.length != ids.length) revert InvalidAmount();
        values = new uint256[](accounts.length);
        for (uint256 i; i < accounts.length; ++i) values[i] = balanceOf(accounts[i], ids[i]);
    }

    function setApprovalForAll(address operator, bool approved) external {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address account, address operator) external view returns (bool) {
        return _operatorApprovals[account][operator];
    }

    function uri(uint256 id) external view returns (string memory) {
        maxSupply(id);
        return string.concat(_baseURI, _toString(id), ".json");
    }

    function setBaseURI(string calldata value) external onlyOwner {
        _baseURI = value;
        emit BaseURIUpdated(value);
        for (uint256 id = 1; id <= 7; ++id) emit URI(string.concat(value, _toString(id), ".json"), id);
    }

    function setPaused(bool value) external onlyOwner {
        paused = value;
        emit Paused(value);
    }

    function mint(uint256 id, uint256 amount) external nonReentrant {
        if (paused) revert MintPaused();
        if (amount == 0) revert InvalidAmount();
        uint256 cap = maxSupply(id);
        uint256 nextMinted = minted[id] + amount;
        if (nextMinted > cap) revert SoldOut();

        uint256 cost = MINT_PRICE * amount;
        if (!usdg.transferFrom(msg.sender, treasury, cost)) revert PaymentFailed();

        minted[id] = nextMinted;
        _balances[id][msg.sender] += amount;
        emit TransferSingle(msg.sender, address(0), msg.sender, id, amount);
        _doSafeTransferAcceptanceCheck(msg.sender, address(0), msg.sender, id, amount, "");
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external {
        if (to == address(0)) revert ZeroAddress();
        if (msg.sender != from && !_operatorApprovals[from][msg.sender]) revert NotAuthorized();
        uint256 fromBalance = _balances[id][from];
        if (fromBalance < amount) revert InvalidAmount();
        unchecked { _balances[id][from] = fromBalance - amount; }
        _balances[id][to] += amount;
        emit TransferSingle(msg.sender, from, to, id, amount);
        _doSafeTransferAcceptanceCheck(msg.sender, from, to, id, amount, data);
    }

    function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data) external {
        if (to == address(0)) revert ZeroAddress();
        if (ids.length != amounts.length) revert InvalidAmount();
        if (msg.sender != from && !_operatorApprovals[from][msg.sender]) revert NotAuthorized();
        for (uint256 i; i < ids.length; ++i) {
            uint256 fromBalance = _balances[ids[i]][from];
            if (fromBalance < amounts[i]) revert InvalidAmount();
            unchecked { _balances[ids[i]][from] = fromBalance - amounts[i]; }
            _balances[ids[i]][to] += amounts[i];
        }
        emit TransferBatch(msg.sender, from, to, ids, amounts);
        if (to.code.length != 0) {
            try IERC1155ReceiverChainling(to).onERC1155BatchReceived(msg.sender, from, ids, amounts, data) returns (bytes4 response) {
                if (response != IERC1155ReceiverChainling.onERC1155BatchReceived.selector) revert UnsafeRecipient();
            } catch { revert UnsafeRecipient(); }
        }
    }

    function _doSafeTransferAcceptanceCheck(address operator, address from, address to, uint256 id, uint256 amount, bytes memory data) private {
        if (to.code.length == 0) return;
        try IERC1155ReceiverChainling(to).onERC1155Received(operator, from, id, amount, data) returns (bytes4 response) {
            if (response != IERC1155ReceiverChainling.onERC1155Received.selector) revert UnsafeRecipient();
        } catch { revert UnsafeRecipient(); }
    }

    function _toString(uint256 value) private pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}