import { useState, useEffect, useCallback } from "react";

export interface WalletState {
  address: string | null;
  shortAddress: string | null;
  connected: boolean;
  connecting: boolean;
  hasPhantom: boolean;
}

export function usePhantomWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    shortAddress: null,
    connected: false,
    connecting: false,
    hasPhantom: false,
  });

  const phantom = () => (window as any).phantom?.solana;

  useEffect(() => {
    const p = phantom();
    setState((s) => ({ ...s, hasPhantom: !!p }));
    if (p?.isConnected) {
      const addr = p.publicKey?.toString() ?? null;
      setState((s) => ({
        ...s, address: addr, connected: !!addr,
        shortAddress: addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : null,
      }));
    }
    const onConnect = (pk: any) => {
      const addr = pk?.toString() ?? null;
      setState((s) => ({
        ...s, address: addr, connected: !!addr, connecting: false,
        shortAddress: addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : null,
      }));
    };
    const onDisconnect = () =>
      setState((s) => ({ ...s, address: null, connected: false, shortAddress: null }));

    p?.on("connect", onConnect);
    p?.on("disconnect", onDisconnect);
    return () => { p?.off?.("connect", onConnect); p?.off?.("disconnect", onDisconnect); };
  }, []);

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
    } catch {
      setState((s) => ({ ...s, connecting: false }));
    }
  }, []);

  const disconnect = useCallback(async () => {
    await phantom()?.disconnect();
    setState((s) => ({ ...s, address: null, connected: false, shortAddress: null }));
  }, []);

  return { ...state, connect, disconnect };
}
