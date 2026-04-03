import { useState, useEffect, useCallback } from "react";

const GNARP_MINT = "5EbMhNWHEvRMS2k7MEPXz9dtR6j1YyEvwY6qDGobpump";
const SOL_RPC   = "https://api.mainnet-beta.solana.com";

export interface WalletState {
  address: string | null;
  shortAddress: string | null;
  connected: boolean;
  connecting: boolean;
  hasPhantom: boolean;
  gnarpBalance: number | null;
  balanceLoading: boolean;
}

async function fetchSPLBalance(walletAddress: string): Promise<number> {
  try {
    const resp = await fetch(SOL_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1,
        method: "getTokenAccountsByOwner",
        params: [
          walletAddress,
          { mint: GNARP_MINT },
          { encoding: "jsonParsed" },
        ],
      }),
    });
    const json = await resp.json();
    const accounts: any[] = json.result?.value ?? [];
    if (accounts.length === 0) return 0;
    const uiAmount = accounts[0].account.data.parsed.info.tokenAmount.uiAmount;
    return Number(uiAmount) || 0;
  } catch {
    return 0;
  }
}

export function usePhantomWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    shortAddress: null,
    connected: false,
    connecting: false,
    hasPhantom: false,
    gnarpBalance: null,
    balanceLoading: false,
  });

  const phantom = () => (window as any).phantom?.solana;

  const loadBalance = useCallback(async (addr: string) => {
    setState((s) => ({ ...s, balanceLoading: true }));
    const bal = await fetchSPLBalance(addr);
    setState((s) => ({ ...s, gnarpBalance: bal, balanceLoading: false }));
  }, []);

  useEffect(() => {
    const p = phantom();
    setState((s) => ({ ...s, hasPhantom: !!p }));
    if (p?.isConnected) {
      const addr = p.publicKey?.toString() ?? null;
      if (addr) {
        setState((s) => ({
          ...s, address: addr, connected: true,
          shortAddress: `${addr.slice(0, 4)}...${addr.slice(-4)}`,
        }));
        loadBalance(addr);
      }
    }
    const onConnect = (pk: any) => {
      const addr = pk?.toString() ?? null;
      setState((s) => ({
        ...s, address: addr, connected: !!addr, connecting: false,
        shortAddress: addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : null,
      }));
      if (addr) loadBalance(addr);
    };
    const onDisconnect = () =>
      setState((s) => ({
        ...s, address: null, connected: false,
        shortAddress: null, gnarpBalance: null,
      }));

    p?.on("connect", onConnect);
    p?.on("disconnect", onDisconnect);
    return () => { p?.off?.("connect", onConnect); p?.off?.("disconnect", onDisconnect); };
  }, [loadBalance]);

  const connect = useCallback(async () => {
    const p = phantom();
    if (!p) { window.open("https://phantom.app", "_blank"); return; }
    setState((s) => ({ ...s, connecting: true }));
    try {
      const resp = await p.connect();
      const addr = resp.publicKey.toString();
      setState((s) => ({
        ...s, address: addr, connected: true, connecting: false,
        shortAddress: `${addr.slice(0, 4)}...${addr.slice(-4)}`,
      }));
      loadBalance(addr);
    } catch {
      setState((s) => ({ ...s, connecting: false }));
    }
  }, [loadBalance]);

  const disconnect = useCallback(async () => {
    await phantom()?.disconnect();
    setState((s) => ({
      ...s, address: null, connected: false,
      shortAddress: null, gnarpBalance: null,
    }));
  }, []);

  const refreshBalance = useCallback(() => {
    if (state.address) loadBalance(state.address);
  }, [state.address, loadBalance]);

  return { ...state, connect, disconnect, refreshBalance };
}
