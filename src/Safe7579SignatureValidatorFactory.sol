// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {Safe7579SignatureValidator} from "./Safe7579SignatureValidator.sol";

// TODO: add ownable / upgradability
// TODO: query safe if signer adapter is still owner or not
contract Safe7579SignatureValidatorFactory is Ownable {
    error InvalidValidator();

    Safe7579SignatureValidator public immutable safe7579SignatureValidatorImpl;
    mapping(address => bool) public validators;

    constructor(
        address initialOwner,
        address[] memory _validators
    ) Ownable(initialOwner) {
        // super(initialOwner);
        safe7579SignatureValidatorImpl = new Safe7579SignatureValidator();

        if (_validators.length != 0) {
            for (uint256 i = 0; i < _validators.length; i++) {
                validators[_validators[i]] = true;
            }
        }
    }

    // TODO: check if
    // data isn't empty
    // selected validator is valid ( checking registry? )
    function createSafe7579SignatureValidator(
        address validator,
        bytes memory data,
        uint256 _salt
    ) external returns (Safe7579SignatureValidator proxy) {
        if (!validators[validator]) {
            revert InvalidValidator();
        }

        address addr = getAddress(validator, data, _salt);
        uint codeSize = addr.code.length;
        if (codeSize > 0) {
            return Safe7579SignatureValidator(payable(addr));
        }

        proxy = Safe7579SignatureValidator(
            payable(
                new ERC1967Proxy{salt: bytes32(_salt)}(
                    address(safe7579SignatureValidatorImpl),
                    abi.encodeCall(
                        Safe7579SignatureValidator.initialize,
                        (validator, data)
                    )
                )
            )
        );
    }

    /**
     * calculate the counterfactual address of this account as it would be returned by createAccount()
     */
    function getAddress(
        address validator,
        bytes memory data,
        uint256 _salt
    ) public view returns (address) {
        return
            Create2.computeAddress(
                bytes32(_salt),
                keccak256(
                    abi.encodePacked(
                        type(ERC1967Proxy).creationCode,
                        abi.encode(
                            address(safe7579SignatureValidatorImpl),
                            abi.encodeCall(
                                Safe7579SignatureValidator.initialize,
                                (validator, data)
                            )
                        )
                    )
                )
            );
    }

    function addValidator(address _validator) external onlyOwner {
        validators[_validator] = true;
    }

    function removeValidator(address _validator) external onlyOwner {
        validators[_validator] = false;
    }

    function getIsValidatorEnabled(
        address _validator
    ) public view returns (bool) {
        return validators[_validator];
    }
}
