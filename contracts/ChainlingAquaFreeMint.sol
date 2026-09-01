// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC1155ReceiverAqua {
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external returns (bytes4);

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external returns (bytes4);
}

/// @title Chainling Aqua Kingfisher Free Mint
/// @notice A free ERC-1155 campaign edition with an 8,888 supply cap and one claim per wallet.
contract ChainlingAquaFreeMint {
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values);
    event ApprovalForAll(address indexed account, address indexed operator, bool approved);
    event URI(string value, uint256 indexed id);
    event Paused(bool value);

    error AlreadyClaimed();
    error InvalidAmount();
    error InvalidToken();
    error MintPaused();
    error NotAuthorized();
    error Reentrancy();
    error SoldOut();
    error UnsafeRecipient();
    error ZeroAddress();

    string public constant name = "Chainling Aqua Kingfisher Free Mint";
    string public constant symbol = "AQUA";
    uint256 public constant TOKEN_ID = 6;
    uint256 public constant MAX_SUPPLY = 8_888;

    address public immutable owner;
    string private _tokenURI;
    uint256 public minted;
    bool public paused;
    uint256 private _locked = 1;

    mapping(address => bool) public claimed;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    constructor(address ownerAddress, string memory tokenURI_) {
        if (ownerAddress == address(0)) revert ZeroAddress();
        owner = ownerAddress;
        _tokenURI = tokenURI_;
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

    function uri(uint256 id) external view returns (string memory) {
        if (id != TOKEN_ID) revert InvalidToken();
        return _tokenURI;
    }

    function balanceOf(address account, uint256 id) public view returns (uint256) {
        if (account == address(0)) revert ZeroAddress();
        if (id != TOKEN_ID) revert InvalidToken();
        return _balances[account];
    }

    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view returns (uint256[] memory values) {
        if (accounts.length != ids.length) revert InvalidAmount();
        values = new uint256[](accounts.length);
        for (uint256 i; i < accounts.length; ++i) values[i] = balanceOf(accounts[i], ids[i]);
    }

    function mint() external nonReentrant {
        if (paused) revert MintPaused();
        if (claimed[msg.sender]) revert AlreadyClaimed();
        if (minted >= MAX_SUPPLY) revert SoldOut();

        claimed[msg.sender] = true;
        minted += 1;
        _balances[msg.sender] += 1;
        emit TransferSingle(msg.sender, address(0), msg.sender, TOKEN_ID, 1);
        _checkReceiver(msg.sender, address(0), msg.sender, TOKEN_ID, 1, "");
    }

    function setPaused(bool value) external onlyOwner {
        paused = value;
        emit Paused(value);
    }

    function setApprovalForAll(address operator, bool approved) external {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address account, address operator) external view returns (bool) {
        return _operatorApprovals[account][operator];
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external {
        if (to == address(0)) revert ZeroAddress();
        if (id != TOKEN_ID) revert InvalidToken();
        if (amount == 0 || _balances[from] < amount) revert InvalidAmount();
        if (msg.sender != from && !_operatorApprovals[from][msg.sender]) revert NotAuthorized();

        unchecked { _balances[from] -= amount; }
        _balances[to] += amount;
        emit TransferSingle(msg.sender, from, to, id, amount);
        _checkReceiver(msg.sender, from, to, id, amount, data);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external {
        if (to == address(0)) revert ZeroAddress();
        if (ids.length != 1 || amounts.length != 1 || ids[0] != TOKEN_ID) revert InvalidAmount();
        if (amounts[0] == 0 || _balances[from] < amounts[0]) revert InvalidAmount();
        if (msg.sender != from && !_operatorApprovals[from][msg.sender]) revert NotAuthorized();

        unchecked { _balances[from] -= amounts[0]; }
        _balances[to] += amounts[0];
        emit TransferBatch(msg.sender, from, to, ids, amounts);
        if (to.code.length != 0) {
            try IERC1155ReceiverAqua(to).onERC1155BatchReceived(msg.sender, from, ids, amounts, data) returns (bytes4 response) {
                if (response != IERC1155ReceiverAqua.onERC1155BatchReceived.selector) revert UnsafeRecipient();
            } catch { revert UnsafeRecipient(); }
        }
    }

    function _checkReceiver(address operator, address from, address to, uint256 id, uint256 amount, bytes memory data) private {
        if (to.code.length == 0) return;
        try IERC1155ReceiverAqua(to).onERC1155Received(operator, from, id, amount, data) returns (bytes4 response) {
            if (response != IERC1155ReceiverAqua.onERC1155Received.selector) revert UnsafeRecipient();
        } catch { revert UnsafeRecipient(); }
    }
}
