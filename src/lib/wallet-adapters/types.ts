export interface WalletAdapter {
  name: string;
  icon: string;
  isAvailable(): boolean;
  connect(): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  signTransaction(transactionXdr: string, networkPassphrase: string): Promise<string>;
  getPublicKey(): Promise<string>;
  isConnected(): Promise<boolean>;
}

export interface WalletConnection {
  publicKey: string;
  signTransaction: (transactionXdr: string) => Promise<string>;
}

export interface WalletInfo {
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean;
  adapter: WalletAdapter;
}

export type WalletType = 'freighter' | 'lobstr' | 'rabet' | 'albedo' | 'xbull' | 'passkey';
