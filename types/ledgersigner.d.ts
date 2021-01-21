/// <reference types="ledgerhq__hw-transport" />
import { AccountData, OfflineSigner, StdSignDoc } from "@cosmjs/launchpad";
import { AminoSignResponse } from "@cosmjs/launchpad";
import Transport from "@ledgerhq/hw-transport";
import { LaunchpadLedgerOptions } from "./launchpadledger";
export declare class LedgerSigner implements OfflineSigner {
  private readonly ledger;
  private readonly hdPaths;
  private accounts?;
  constructor(transport: Transport, options?: LaunchpadLedgerOptions);
  getAccounts(): Promise<readonly AccountData[]>;
  signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse>;
}
