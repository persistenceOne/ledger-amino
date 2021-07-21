"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaunchpadLedger = void 0;
const crypto_1 = require("@cosmjs/crypto");
const encoding_1 = require("@cosmjs/encoding");
const utils_1 = require("@cosmjs/utils");
const ledger_cosmos_js_1 = __importDefault(require("ledger-cosmos-js"));
const semver_1 = __importDefault(require("semver"));
/* eslint-enable */
function makeHdPath(accountNumber = "0", addressIndex = "0", coinType = "750") {
    return crypto_1.stringToPath("m/44'/" + coinType + "'/" + accountNumber + "'/0/" + addressIndex);
}
function unharden(hdPath) {
    return hdPath.map((n) => (n.isHardened() ? n.toNumber() - 2 ** 31 : n.toNumber()));
}
const persistenceHdPath = makeHdPath();
const persistenceBech32Prefix = "persistence";
const requiredPersistenceAppVersion = "1.0.0";
class LaunchpadLedger {
    constructor(transport, options = {}) {
        var _a, _b, _c;
        const defaultOptions = {
            hdPaths: [persistenceHdPath],
            prefix: persistenceBech32Prefix,
            testModeAllowed: false,
        };
        this.testModeAllowed = (_a = options.testModeAllowed) !== null && _a !== void 0 ? _a : defaultOptions.testModeAllowed;
        this.hdPaths = (_b = options.hdPaths) !== null && _b !== void 0 ? _b : defaultOptions.hdPaths;
        this.prefix = (_c = options.prefix) !== null && _c !== void 0 ? _c : defaultOptions.prefix;
        this.app = new ledger_cosmos_js_1.default(transport);
    }
    async getCosmosAppVersion() {
        await this.verifyCosmosAppIsOpen();
        utils_1.assert(this.app, "Persistence Ledger App is not connected");
        const response = await this.app.getVersion();
        this.handleLedgerErrors(response);
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { major, minor, patch, test_mode: testMode } = response;
        this.verifyAppMode(testMode);
        return `${major}.${minor}.${patch}`;
    }
    async getPubkey(hdPath) {
        await this.verifyDeviceIsReady();
        utils_1.assert(this.app, "Persistence Ledger App is not connected");
        const hdPathToUse = hdPath || this.hdPaths[0];
        // ledger-cosmos-js hardens the first three indices
        const response = await this.app.publicKey(unharden(hdPathToUse));
        this.handleLedgerErrors(response);
        return Uint8Array.from(response.compressed_pk);
    }
    async getPubkeys() {
        return this.hdPaths.reduce((promise, hdPath) => promise.then(async (pubkeys) => [...pubkeys, await this.getPubkey(hdPath)]), Promise.resolve([]));
    }
    async getCosmosAddress(pubkey) {
        const pubkeyToUse = pubkey || (await this.getPubkey());
        return ledger_cosmos_js_1.default.getBech32FromPK(this.prefix, Buffer.from(pubkeyToUse));
    }
    async sign(message, hdPath) {
        await this.verifyDeviceIsReady();
        utils_1.assert(this.app, "Persistence Ledger App is not connected");
        const hdPathToUse = hdPath || this.hdPaths[0];
        // ledger-cosmos-js hardens the first three indices
        const response = await this.app.sign(unharden(hdPathToUse), encoding_1.fromUtf8(message));
        this.handleLedgerErrors(response, "Transaction signing request was rejected by the user");
        return crypto_1.Secp256k1Signature.fromDer(response.signature).toFixedLength();
    }
    verifyAppMode(testMode) {
        if (testMode && !this.testModeAllowed) {
            throw new Error(`DANGER: The Persistence Ledger app is in test mode and should not be used on mainnet!`);
        }
    }
    async getOpenAppName() {
        utils_1.assert(this.app, "Persistence Ledger App is not connected");
        const response = await this.app.appInfo();
        this.handleLedgerErrors(response);
        return response.appName;
    }
    async verifyAppVersion() {
        const version = await this.getCosmosAppVersion();
        if (!semver_1.default.gte(version, requiredPersistenceAppVersion)) {
            throw new Error("Outdated version: Please update Persistence Ledger App to the latest version.");
        }
    }
    async verifyCosmosAppIsOpen() {
        const appName = await this.getOpenAppName();
        if (appName.toLowerCase() === `dashboard`) {
            throw new Error(`Please open the Persistence Ledger app on your Ledger device.`);
        }
        if (appName.toLowerCase() !== `persistence`) {
            throw new Error(`Please close ${appName} and open the Persistence Ledger app on your Ledger device.`);
        }
    }
    async verifyDeviceIsReady() {
        await this.verifyAppVersion();
        await this.verifyCosmosAppIsOpen();
    }
    async verifyAddress(hdPath) {
        await this.verifyDeviceIsReady();
        utils_1.assert(this.app, "Persistence Ledger App is not connected");
        const hdPathToUse = hdPath;
        // ledger-cosmos-js hardens the first three indices
        const response = await this.app.showAddressAndPubKey(unharden(hdPathToUse), "persistence");
        this.handleLedgerErrors(response);
        return response;
    }
    handleLedgerErrors(
    /* eslint-disable @typescript-eslint/naming-convention */
    { error_message: errorMessage = "No errors", device_locked: deviceLocked = false, }, 
    /* eslint-enable */
    rejectionMessage = "Request was rejected by the user") {
        if (deviceLocked) {
            throw new Error("Ledger’s screensaver mode is on");
        }
        switch (errorMessage) {
            case "U2F: Timeout":
                throw new Error("Connection timed out. Please try again.");
            case "Persistence app does not seem to be open": //check this
                throw new Error("Persistence app is not open");
            case "Command not allowed":
                throw new Error("Transaction rejected");
            case "Transaction rejected":
                throw new Error(rejectionMessage);
            case "Unknown Status Code: 26628":
                throw new Error("Ledger’s screensaver mode is on");
            case "Instruction not supported":
                throw new Error(`Your Persistence Ledger App is not up to date. Please update to version ${requiredPersistenceAppVersion}.`);
            case "No errors":
                break;
            default:
                throw new Error(`Ledger Native Error: ${errorMessage}`);
        }
    }
}
exports.LaunchpadLedger = LaunchpadLedger;
//# sourceMappingURL=launchpadledger.js.map