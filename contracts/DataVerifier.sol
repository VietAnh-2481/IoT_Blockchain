// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IoTRegistry} from "./IoTRegistry.sol";

/// @title DataVerifier
/// @notice Accepts and stores immutable IoT data submissions from active, registered devices.
contract DataVerifier is Ownable {
    struct Submission {
        bytes32 deviceId;
        bytes32 dataHash;
        string dataURI;
        address submitter;
        uint256 timestamp;
    }

    error InvalidRegistryAddress();
    error NotDeviceOwner(bytes32 deviceId, address caller);
    error DeviceInactive(bytes32 deviceId);
    error InvalidUsdcAddress();
    error NoFeesToWithdraw();
    error FeeTransferFailed();

    IoTRegistry public immutable registry;
    IERC20 public immutable usdc;

    uint256 public submissionFee;
    uint256 public accruedFees;

    Submission[] private _submissions;
    mapping(bytes32 => uint256[]) private _deviceSubmissionIds;

    event DataSubmitted(
        uint256 indexed submissionId,
        bytes32 indexed deviceId,
        bytes32 dataHash,
        address submitter,
        uint256 timestamp
    );
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);

    constructor(address registryAddress, address usdcAddress) Ownable(msg.sender) {
        if (registryAddress == address(0)) {
            revert InvalidRegistryAddress();
        }
        if (usdcAddress == address(0)) {
            revert InvalidUsdcAddress();
        }

        registry = IoTRegistry(registryAddress);
        usdc = IERC20(usdcAddress);
        submissionFee = 10_000;
    }

    /// @notice Submit a data record for a registered and active device.
    /// @dev Caller must be the device owner in IoTRegistry.
    function submitData(
        bytes32 deviceId,
        bytes32 dataHash,
        string calldata dataURI
    ) external {
        (, address deviceOwner, , , bool active) = registry.getDevice(deviceId);

        if (msg.sender != deviceOwner) {
            revert NotDeviceOwner(deviceId, msg.sender);
        }
        if (!active) {
            revert DeviceInactive(deviceId);
        }

        if (submissionFee > 0) {
            uint256 balanceBefore = usdc.balanceOf(address(this));
            bool ok = usdc.transferFrom(msg.sender, address(this), submissionFee);
            if (!ok) {
                revert FeeTransferFailed();
            }
            uint256 received = usdc.balanceOf(address(this)) - balanceBefore;
            accruedFees += received;
        }

        uint256 submissionId = _submissions.length;

        _submissions.push(
            Submission({
                deviceId: deviceId,
                dataHash: dataHash,
                dataURI: dataURI,
                submitter: msg.sender,
                timestamp: block.timestamp
            })
        );

        _deviceSubmissionIds[deviceId].push(submissionId);

        emit DataSubmitted(
            submissionId,
            deviceId,
            dataHash,
            msg.sender,
            block.timestamp
        );
    }

    function setSubmissionFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = submissionFee;
        submissionFee = newFee;
        emit FeeUpdated(oldFee, newFee);
    }

    function withdrawFees(address to) external onlyOwner {
        uint256 amount = accruedFees;
        if (amount == 0) {
            revert NoFeesToWithdraw();
        }

        accruedFees = 0;
        bool ok = usdc.transfer(to, amount);
        if (!ok) {
            revert FeeTransferFailed();
        }

        emit FeesWithdrawn(to, amount);
    }

    /// @notice Return a submission by id.
    function getSubmission(
        uint256 submissionId
    ) external view returns (Submission memory) {
        return _submissions[submissionId];
    }

    /// @notice Return all submission IDs for a given device.
    function getDeviceSubmissions(
        bytes32 deviceId
    ) external view returns (uint256[] memory) {
        return _deviceSubmissionIds[deviceId];
    }

    /// @notice Return the total number of stored submissions.
    function totalSubmissions() external view returns (uint256) {
        return _submissions.length;
    }
}
