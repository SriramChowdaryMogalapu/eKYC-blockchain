const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

// Configuration
const connectionProfilePath = path.resolve(__dirname, '..','fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
const channelName = 'mychannel';
const contractName = 'ekyc';

// Load the connection profile
const ccp = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

// Helper function to get the contract
async function getContract() {
    const walletPath = path.resolve(__dirname, 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get('appUser');
    if (!identity) {
        throw new Error('Identity "appUser" does not exist in the wallet. Run the enrollAdmin.js and registerUser.js scripts.');
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork(channelName);
    return network.getContract(contractName);
}

// Add a KYC record
async function addKYCRecord(username, fullName, phoneNumber, aadharNumber, ipfsHash) {
    try {
        const contract = await getContract();
        await contract.submitTransaction('addKYCRecord', username, fullName, phoneNumber, aadharNumber, ipfsHash);
        console.log(`KYC record for "${username}" added successfully.`);
    } catch (error) {
        console.error(`Failed to add KYC record for "${username}": ${error.message}`);
    }
}

// Update the status of a KYC request
async function updateKYCStatus(username, fiusername, status) {
    try {
        const contract = await getContract();
        await contract.submitTransaction('updateKYCStatus', username, fiusername, status);
        console.log(`KYC status for "${username}" updated to "${status}".`);
    } catch (error) {
        console.error(`Failed to update KYC status for "${username}": ${error.message}`);
    }
}

// Record an access request for KYC data
async function recordAccessRequest(username, fiusername, status) {
    try {
        const contract = await getContract();
        await contract.submitTransaction('recordAccessRequest', username, fiusername, status);
        console.log(`Access request for "${username}" by "${fiusername}" recorded.`);
    } catch (error) {
        console.error(`Failed to record access request for "${username}": ${error.message}`);
    }
}

// Fetch all verified users from the blockchain
async function getVerifiedUsersFromBlockchain() {
    try {
        const contract = await getContract();
        const result = await contract.evaluateTransaction('getVerifiedUsersFromBlockchain');
        console.log('Verified users fetched successfully.');
        return JSON.parse(result.toString());
    } catch (error) {
        console.error(`Failed to fetch verified users: ${error.message}`);
    }
}

// Query the KYC status of a user
async function queryKYCStatus(username) {
    try {
        const contract = await getContract();
        const result = await contract.evaluateTransaction('queryKYCStatus', username);
        console.log(`KYC status for "${username}" fetched successfully.`);
        return JSON.parse(result.toString());
    } catch (error) {
        console.error(`Failed to query KYC status for "${username}": ${error.message}`);
    }
}

// Delete a KYC record
async function deleteKYCRecord(username) {
    try {
        const contract = await getContract();
        await contract.submitTransaction('deleteKYCRecord', username);
        console.log(`KYC record for "${username}" deleted successfully.`);
    } catch (error) {
        console.error(`Failed to delete KYC record for "${username}": ${error.message}`);
    }
}

// Update an existing KYC record
async function updateKYCRecord(username, updatedDetails) {
    try {
        const contract = await getContract();
        await contract.submitTransaction('updateKYCRecord', username, JSON.stringify(updatedDetails));
        console.log(`KYC record for "${username}" updated successfully.`);
    } catch (error) {
        console.error(`Failed to update KYC record for "${username}": ${error.message}`);
    }
}

// Export the functions
module.exports = {
    addKYCRecord,
    updateKYCStatus,
    recordAccessRequest,
    getVerifiedUsersFromBlockchain,
    queryKYCStatus,
    deleteKYCRecord,
    updateKYCRecord,
};
