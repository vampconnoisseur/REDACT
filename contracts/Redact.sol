// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

contract Redact {

    mapping(string => string) private maskedToOriginal;
    mapping(uint => string[]) private userIdToLinks;
    uint[] private userIds;
    uint private userIdCounter;

    // Salt for hashing, initialized through the constructor
    string private salt;

    // Event to log when a link is masked
    event LinkMasked(uint indexed userId, string maskedLink);

    // Constructor to initialize the salt
    constructor(string memory initialSalt) {
        salt = initialSalt;
    }

    // Function to store image on IPFS and get back the link
    // This is a placeholder function. In a real-world scenario, 
    // you'd integrate with an IPFS service.
    function imageToLink(string memory image) internal view returns (string memory) {
        // Concatenate the image string with salt
        string memory saltedImage = string(abi.encodePacked(image, salt));

        // Hash the salted image string using keccak256
        bytes32 hash = keccak256(abi.encodePacked(saltedImage));

        // Convert hash to string
        return toHexString(hash);
    }

    // Function to mask an IPFS link
    function mask(uint userId, string memory originalLink, string memory maskedLink) public returns (string memory) {
        // Ensure the user ID exists
        require(userIdExists(userId), "User ID does not exist");

        // Store the masked and original links in the mapping
        maskedToOriginal[maskedLink] = originalLink;

        // Store the masked link in the user's list of links
        userIdToLinks[userId].push(maskedLink);

        // Emit the event
        emit LinkMasked(userId, maskedLink);

        return maskedLink;
    }

    // Function to demask a link
    function demask(string memory maskedLink) public view returns (string memory) {
        // Validate the link
        require(validate(maskedLink), "Invalid masked link");

        // Return the original link
        return maskedToOriginal[maskedLink];
    }

    // Function to validate if a masked link exists
    function validate(string memory maskedLink) public view returns (bool) {
        // Check if the masked link exists in the mapping
        return bytes(maskedToOriginal[maskedLink]).length > 0;
    }

    // Utility function to check if a user ID exists
    function userIdExists(uint userId) internal view returns (bool) {
        for (uint i = 0; i < userIds.length; i++) {
            if (userIds[i] == userId) {
                return true;
            }
        }
        return false;
    }

    // Function to add a new user and get a user ID
    function addUser() public returns (uint) {
        userIdCounter++;
        userIds.push(userIdCounter);
        return userIdCounter;
    }

    // Function to get the list of masked links for a user
    function getUserLinks(uint userId) public view returns (string[] memory) {
        return userIdToLinks[userId];
    }

    // Utility function to convert bytes32 to a hex string
    function toHexString(bytes32 data) internal pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint i = 0; i < 32; i++) {
            str[2*i] = hexChars[uint8(data[i] >> 4)];
            str[2*i + 1] = hexChars[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
}
