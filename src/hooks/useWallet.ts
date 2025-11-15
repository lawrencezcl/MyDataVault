import { useState, useEffect } from 'react';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { stringToHex } from '@polkadot/util';
import { API_CONFIG } from '../config/api';

export interface WalletAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
    genesisHash?: string;
  };
}

export const useWallet = () => {
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Enable web3 extensions
      const extensions = await web3Enable('MyDataVault');
      
      if (extensions.length === 0) {
        throw new Error('No Polkadot extension found. Please install Talisman, SubWallet, or another compatible wallet.');
      }

      // Get accounts
      const allAccounts = await web3Accounts();
      
      if (allAccounts.length === 0) {
        throw new Error('No accounts found. Please create or import an account in your wallet.');
      }

      setAccounts(allAccounts);
      setIsConnected(true);
      
      // Auto-select first account
      if (allAccounts.length > 0) {
        setSelectedAccount(allAccounts[0]);
      }

      return allAccounts;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      setIsConnected(false);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccounts([]);
    setSelectedAccount(null);
    setIsConnected(false);
    setError(null);
  };

  const signMessage = async (message: string, account?: WalletAccount): Promise<string> => {
    const accountToUse = account || selectedAccount;
    if (!accountToUse) {
      throw new Error('No account selected');
    }

    try {
      const { web3FromSource } = await import('@polkadot/extension-dapp');
      const injector = await web3FromSource(accountToUse.meta.source);
      
      const signRaw = injector?.signer?.signRaw;
      if (!signRaw) {
        throw new Error('Wallet does not support message signing');
      }

      const { signature } = await signRaw({
        address: accountToUse.address,
        data: stringToHex(message),
        type: 'bytes'
      });

      return signature;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign message';
      throw new Error(`Message signing failed: ${errorMessage}`);
    }
  };

  const authenticateWithBackend = async (account?: WalletAccount) => {
    const accountToUse = account || selectedAccount;
    if (!accountToUse) {
      throw new Error('No account selected');
    }

    try {
      const message = `MyDataVault authentication ${Date.now()}`;
      const signature = await signMessage(message, accountToUse);

      const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.endpoints.authWallet), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: accountToUse.address,
          signature,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userAddress', accountToUse.address);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      throw new Error(`Backend authentication failed: ${errorMessage}`);
    }
  };

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      try {
        const extensions = await web3Enable('MyDataVault');
        if (extensions.length > 0) {
          const allAccounts = await web3Accounts();
          if (allAccounts.length > 0) {
            setAccounts(allAccounts);
            setIsConnected(true);
            
            // Restore selected account from localStorage
            const savedAddress = localStorage.getItem('userAddress');
            const savedAccount = allAccounts.find(acc => acc.address === savedAddress);
            if (savedAccount) {
              setSelectedAccount(savedAccount);
            } else {
              setSelectedAccount(allAccounts[0]);
            }
          }
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    };

    checkConnection();
  }, []);

  return {
    accounts,
    selectedAccount,
    isConnecting,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
    setSelectedAccount,
    signMessage,
    authenticateWithBackend,
  };
};