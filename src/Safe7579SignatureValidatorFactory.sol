// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.25;

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {Safe7579SignatureValidator} from "./Safe7579SignatureValidator.sol";

// TODO: add ownable / upgradability
contract Safe7579SignatureValidatorFactory {
    error InvalidValidator();

    mapping(address => bool) public validators;

    constructor(address _validator) {
        validators[_validator] = true;
    }

    // TODO: addValidator methods

    // TODO: removeValidator methods

    // TODO: check if
    // data isn't empty
    // selected validator is valid ( checking registry? )
    function deploySafe7579SignatureValidator(
        address validator,
        bytes memory data
    ) external returns (address) {
        if (!validators[validator]) {
            revert InvalidValidator();
        }
        bytes32 salt = keccak256(abi.encodePacked(data));

        // Deploy and return signer contract
        return
            address(
                new Safe7579SignatureValidator{salt: salt}(validator, data)
            );
    }
}
