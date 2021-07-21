/// <reference types="ledgerhq__hw-transport" />
import { AccountData, AminoSignResponse, OfflineAminoSigner, StdSignDoc } from "@cosmjs/amino";
import { HdPath } from "@cosmjs/crypto";
import Transport from "@ledgerhq/hw-transport";
import { LaunchpadLedgerOptions } from "./launchpadledger";
import { AddressAndPublicKeyResponse, ErrorResponse } from "ledger-cosmos-js";
export declare class LedgerSigner implements OfflineAminoSigner {
    private readonly ledger;
    private readonly hdPaths;
    private accounts?;
    constructor(transport: Transport, options?: LaunchpadLedgerOptions);
    getAccounts(): Promise<readonly AccountData[]>;
    showAddress(path: HdPath): Promise<AddressAndPublicKeyResponse | ErrorResponse>;
    signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse>;
}
