// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title IoTRegistry
/// @notice Registers IoT devices and tracks their ownership and activation status.
contract IoTRegistry is Ownable {
    struct Device {
        bytes32 deviceId;
        address owner;
        bytes pubKey;
        string metadataURI;
        bool active;
    }

    error DeviceAlreadyRegistered(bytes32 deviceId);
    error DeviceNotRegistered(bytes32 deviceId);
    error NotDeviceOwner(bytes32 deviceId, address caller);
    error NotDeviceOwnerOrAdmin(bytes32 deviceId, address caller);

    mapping(bytes32 => Device) private _devices;
    mapping(bytes32 => bool) private _registered;

    event DeviceRegistered(
        bytes32 indexed deviceId,
        address indexed owner,
        bytes pubKey,
        string metadataURI
    );
    event DeviceDeactivated(bytes32 indexed deviceId, address indexed by);
    event DeviceReactivated(bytes32 indexed deviceId, address indexed by);

    constructor() Ownable(msg.sender) {}

    /// @notice Register a new IoT device for the caller.
    /// @dev Reverts if `deviceId` has already been registered.
    function registerDevice(
        bytes32 deviceId,
        bytes calldata pubKey,
        string calldata metadataURI
    ) external {
        if (_registered[deviceId]) {
            revert DeviceAlreadyRegistered(deviceId);
        }

        _devices[deviceId] = Device({
            deviceId: deviceId,
            owner: msg.sender,
            pubKey: pubKey,
            metadataURI: metadataURI,
            active: true
        });
        _registered[deviceId] = true;

        emit DeviceRegistered(deviceId, msg.sender, pubKey, metadataURI);
    }

    /// @notice Deactivate a device.
    /// @dev Callable by the device owner or the contract owner.
    function deactivateDevice(bytes32 deviceId) external {
        if (!_registered[deviceId]) {
            revert DeviceNotRegistered(deviceId);
        }

        Device storage device = _devices[deviceId];
        if (msg.sender != device.owner && msg.sender != owner()) {
            revert NotDeviceOwnerOrAdmin(deviceId, msg.sender);
        }

        device.active = false;
        emit DeviceDeactivated(deviceId, msg.sender);
    }

    /// @notice Reactivate a device.
    /// @dev Callable only by the device owner.
    function reactivateDevice(bytes32 deviceId) external {
        if (!_registered[deviceId]) {
            revert DeviceNotRegistered(deviceId);
        }

        Device storage device = _devices[deviceId];
        if (msg.sender != device.owner) {
            revert NotDeviceOwner(deviceId, msg.sender);
        }

        device.active = true;
        emit DeviceReactivated(deviceId, msg.sender);
    }

    /// @notice Return full information for a registered device.
    function getDevice(
        bytes32 deviceId
    )
        external
        view
        returns (
            bytes32 storedDeviceId,
            address deviceOwner,
            bytes memory pubKey,
            string memory metadataURI,
            bool active
        )
    {
        if (!_registered[deviceId]) {
            revert DeviceNotRegistered(deviceId);
        }

        Device storage device = _devices[deviceId];
        return (
            device.deviceId,
            device.owner,
            device.pubKey,
            device.metadataURI,
            device.active
        );
    }

    /// @notice Returns true if a registered device is currently active.
    /// @dev Returns false for unregistered device IDs.
    function isActive(bytes32 deviceId) external view returns (bool) {
        if (!_registered[deviceId]) {
            return false;
        }

        return _devices[deviceId].active;
    }
}
