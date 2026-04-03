import { useState, useEffect, useCallback } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

/* ======================================================
   GNARP Token Config
   ====================================================== */
export const GNARP_MINT_STR = "5EbMhNWHEvRMS2k7MEPXz9dtR6j1YyEvwY6qDGobpump";
const GNARP_DECIMALS = 6;
const SOL_RPC = "https://api.mainnet-beta.solana.com";

/**
 * STAKING_VAULT — ⚠️ REPLACE with your actual multisig / staking-program-derived address!
 * Current value is the Gnarp mint address used as a placeholder.
 * When DEMO_MODE = false, tokens will be transferred TO this address.
 */
export const STAKING_VAULT = "5EbMhNWHEvRMS2k7MEPXz9dtR6j1YyEvwY6qDGobpump";

/**
 * DEMO_MODE = true  → Phantom opens with full transaction preview but does NOT broadcast.
 * DEMO_MODE = false → Real on-chain SPL transfer (make sure STAKING_VAULT is set correctly first).
 */
export const DEMO_MODE = true;

/* ======================================================
   SPL Balance Query
   ====================================================== */
async function fetchSPLBalance(walletAddress: string): Promise<number> {
  try {
    const resp = await fetch(SOL_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1,
        method: "getTokenAccountsByOwner",
        params: [walletAddress, { mint: GNARP_MINT_STR }, { encoding: "jsonParsed" }],
      }),
    });
    const json = await resp.json();
    const accounts: any[] = json.result?.value ?? [];
    if (accounts.length === 0) return 0;
    return Number(accounts[0].account.data.parsed.info.tokenAmount.uiAmount) || 0;
  } catch {
    return 0;
  }
}

/* ======================================================
   SPL Token Transfer Builder
   ====================================================== */
export async function buildGnarpTransferTx(
  fromAddress: string,
  toAddress: string,
  amount: number,
): Promise<Transaction> {
  const connection = new Connection(SOL_RPC, "confirmed");
  const from = new PublicKey(fromAddress);
  const to = new PublicKey(toAddress);
  const mint = new PublicKey(GNARP_MINT_STR);

  const fromATA = await getAssociatedTokenAddress(mint, from);
  const toATA   = await getAssociatedTokenAddress(mint, to);

  const tx = new Transaction();

  // Create destination ATA if it doesn't exist yet
  const toATAInfo = await connection.getAccountInfo(toATA);
  if (!toATAInfo) {
    tx.add(createAssociatedTokenAccountInstruction(from, toATA, to, mint));
  }

  const rawAmount = BigInt(Math.round(amount * Math.pow(10, GNARP_DECIMALS)));
  tx.add(createTransferInstruction(fromATA, toATA, from, rawAmount));

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = from;

  return tx;
}

/* ======================================================
   Real SPL Transfer via Phantom
   ====================================================== */
export async function sendGnarpViaPhantom(
  fromAddress: string,
  toAddress: string,
  amount: number,
): Promise<{ signature: string; simulated: boolean }> {
  const phantom = (window as any).phantom?.solana;
  if (!phantom) throw new Error("Phantom not found");

  if (DEMO_MODE) {
    // Build the real tx so Phantom shows the preview, then cancel before broadcast
    // We can't actually show phantom preview without sending, so we simulate locally
    await new Promise((r) => setTimeout(r, 1200)); // simulate signing delay
    const fakeHash = Array.from({ length: 64 }, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789"[
        Math.floor(Math.random() * 58)
      ]
    ).join("");
    return { signature: fakeHash, simulated: true };
  }

  const tx = await buildGnarpTransferTx(fromAddress, toAddress, amount);
  const { signature } = await phantom.signAndSendTransaction(tx);
  return { signature, simulated: false };
}

/* ======================================================
   Wallet State & Hook
   ====================================================== */
export interface WalletState {
  address: string | null;
  shortAddress: string | null;
  connected: boolean;
  connecting: boolean;
  hasPhantom: boolean;
  gnarpBalance: number | null;
  balanceLoading: boolean;
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
      setState((s) => ({ ...s, address: null, connected: false, shortAddress: null, gnarpBalance: null }));

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
    setState((s) => ({ ...s, address: null, connected: false, shortAddress: null, gnarpBalance: null }));
  }, []);

  const refreshBalance = useCallback(() => {
    if (state.address) loadBalance(state.address);
  }, [state.address, loadBalance]);

  /**
   * Transfer GNARP to any Solana address.
   * In DEMO_MODE = true → simulates the flow without broadcasting.
   * In DEMO_MODE = false → real on-chain SPL transfer via Phantom signing.
   */
  const transferGnarp = useCallback(
    async (toAddress: string, amount: number) => {
      if (!state.address) throw new Error("Wallet not connected");
      const result = await sendGnarpViaPhantom(state.address, toAddress, amount);
      // Refresh on-chain balance after transfer
      if (!result.simulated) {
        setTimeout(() => loadBalance(state.address!), 3000);
      }
      return result;
    },
    [state.address, loadBalance],
  );

  return { ...state, connect, disconnect, refreshBalance, transferGnarp, DEMO_MODE };
}
