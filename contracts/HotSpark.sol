// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title HotSpark Token (HOT)
 * @notice Fixed supply BEP20/ERC20 utility token
 * @dev Total supply is permanently capped at 1,000,000,000 HOT
 *      No minting after deployment
 */
contract HotSpark is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    ERC20Permit,
    AccessControl
{
    // ================================
    // Roles
    // ================================

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // ================================
    // Constants
    // ================================

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;

    // ================================
    // Events
    // ================================

    event TokensBurned(address indexed from, uint256 amount);

    // ================================
    // Constructor
    // ================================

    constructor()
        ERC20("HotSpark", "HOT")
        ERC20Permit("HotSpark")
    {
        // Grant admin + pauser roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);

        // Mint entire supply to deployer
        _mint(msg.sender, MAX_SUPPLY);
    }

    // ================================
    // Pause Control
    // ================================

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ================================
    // Burn Overrides (Optional Event)
    // ================================

    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(_msgSender(), amount);
    }

    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }

    // ================================
    // Required Override for OZ v5
    // ================================

    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}