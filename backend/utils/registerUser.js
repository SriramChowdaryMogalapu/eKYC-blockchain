const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main() {
    try {
        const ccpPath = path.resolve(__dirname, '..','fabric-samples','test-network','organizations','peerOrganizations','org1.example.com','connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const ca = new FabricCAServices(caInfo.url);

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('Admin identity not found. Run enrollAdmin.js first.');
            return;
        }

        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        const secret = await ca.register(
            {
                affiliation: 'org1.department1',
                enrollmentID: 'appUser',
                role: 'client',
            },
            adminUser
        );

        const enrollment = await ca.enroll({
            enrollmentID: 'appUser',
            enrollmentSecret: secret,
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };

        await wallet.put('appUser', x509Identity);
        console.log('User appUser registered successfully');
    } catch (error) {
        console.error(`Failed to register user: ${error}`);
    }
}

main();
