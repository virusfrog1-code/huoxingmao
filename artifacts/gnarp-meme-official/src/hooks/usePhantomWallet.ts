import { useState, useEffect, useCallback } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

/* ======================================================
   GNARP Token Config
   ====================================================== */
export const GNARP_MINT_STR = "5EbMhNWHEvRMS2k7MEPXz9dtR6j1YyEvwY6qDGobpump";
const GNARP_DECIMALS = 6;

// Use multiple RPC endpoints as fallback for reliability
const RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-mainnet.g.alchemy.com/v2/demo",
  "https://rpc.ankr.com/solana",
];

function getConnection() {
  return new Connection(RPC_ENDPOINTS[0], {
    commitment: "confirmed",
    disableRetryOnRateLimit: false,
  });
}

/**
 * STAKING_VAULT — ⚠️ REPLACE with your actual Solana wallet/multisig address!
 *
 *   Step 1: Generate (or use your existing) Solana keypair address.
 *   Step 2: Replace the string below.
 *   Step 3: Set VAULT_IS_CONFIGURED = true.
 *
 * Example: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHkv"
 */
// === 真实质押接收地址（必须是你自己控制的 Solana 钱包地址）===
export const STAKING_VAULT = "在这里粘贴你的44位Solana地址";
export const VAULT_IS_CONFIGURED = true;

/**
 * DEMO_MODE = false → Real on-chain SPL transfer via Phantom signing (ACTIVE).
 * DEMO_MODE = true  → Simulate flow without broadcasting (disabled).
 */
export const DEMO_MODE = false;

/* ======================================================
   SPL Balance Query — uses web3.js for reliability
   ====================================================== */
export async function fetchSPLBalance(walletAddress: string): Promise<number> {
  try {
    const connection = getConnection();
    const walletPubkey = new PublicKey(walletAddress);
    const mintPubkey   = new PublicKey(GNARP_MINT_STR);

    const result = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { mint: mintPubkey },
    );

    if (result.value.length === 0) return 0;

    // Sum all GNARP token accounts (usually just one ATA)
    const total = result.value.reduce((sum, item) => {
      const uiAmt = item.account.data.parsed?.info?.tokenAmount?.uiAmount ?? 0;
      return sum + Number(uiAmt);
    }, 0);

    return total;
  } catch (err) {
    // Fallback: raw JSON-RPC fetch if web3.js fails
    try {
      const resp = await fetch(RPC_ENDPOINTS[0], {
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
      return accounts.reduce((sum: number, acc: any) => {
        return sum + (Number(acc.account.data.parsed.info.tokenAmount.uiAmount) || 0);
      }, 0);
    } catch {
      console.warn("[GNARP] Balance query failed, returning 0");
      return 0;
    }
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
  if (!VAULT_IS_CONFIGURED && toAddress === GNARP_MINT_STR) {
    throw new Error(
      "质押地址未配置！请在 usePhantomWallet.ts 中修改 STAKING_VAULT 为你控制的钱包地址。",
    );
  }

  const connection = getConnection();
  const from = new PublicKey(fromAddress);
  const to   = new PublicKey(toAddress);
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

  const { blockhash } = await connection.getLatestBlockhash();
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
  if (!phantom?.isConnected) throw new Error("Phantom 未连接，请先点击 Connect Wallet");

  if (!VAULT_IS_CONFIGURED) {
    throw new Error(
      "⚠️ 质押地址未配置！请在 src/hooks/usePhantomWallet.ts 中：\n" +
      "1. 将 STAKING_VAULT 替换为你控制的 Solana 钱包地址\n" +
      "2. 将 VAULT_IS_CONFIGURED 设为 true",
    );
  }

  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 900));
    const fakeHash = Array.from({ length: 64 }, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789"[
        Math.floor(Math.random() * 58)
      ],
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
  address:       string | null;
  shortAddress:  string | null;
  connected:     boolean;
  connecting:    boolean;
  hasPhantom:    boolean;
  gnarpBalance:  number | null;
  balanceLoading: boolean;
}

export function usePhantomWallet() {
  const [state, setState] = useState<WalletState>({
    address:       null,
    shortAddress:  null,
    connected:     false,
    connecting:    false,
    hasPhantom:    false,
    gnarpBalance:  null,
    balanceLoading: false,
  });

  const getPhantom = () => (window as any).phantom?.solana;

  /* ---- Load on-chain GNARP balance ---- */
  const loadBalance = useCallback(async (addr: string) => {
    setState((s) => ({ ...s, balanceLoading: true }));
    const bal = await fetchSPLBalance(addr);
    setState((s) => ({ ...s, gnarpBalance: bal, balanceLoading: false }));
  }, []);

  /* ---- Event listeners + auto-detect existing connection ---- */
  useEffect(() => {
    const p = getPhantom();
    setState((s) => ({ ...s, hasPhantom: !!p }));

    if (p?.isConnected && p.publicKey) {
      const addr = p.publicKey.toString();
      setState((s) => ({
        ...s,
        address: addr,
        connected: true,
        shortAddress: `${addr.slice(0, 4)}...${addr.slice(-4)}`,
      }));
      loadBalance(addr);
    }

    const onConnect = (pk: any) => {
      const addr = pk?.toString() ?? null;
      setState((s) => ({
        ...s,
        address: addr,
        connected: !!addr,
        connecting: false,
        shortAddress: addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : null,
      }));
      if (addr) loadBalance(addr);
    };

    const onDisconnect = () =>
      setState((s) => ({
        ...s,
        address: null,
        connected: false,
        shortAddress: null,
        gnarpBalance: null,
      }));

    const onAccountChange = (pk: any) => {
      const addr = pk?.toString() ?? null;
      if (addr) {
        setState((s) => ({
          ...s,
          address: addr,
          shortAddress: `${addr.slice(0, 4)}...${addr.slice(-4)}`,
        }));
        loadBalance(addr);
      }
    };

    p?.on("connect", onConnect);
    p?.on("disconnect", onDisconnect);
    p?.on("accountChanged", onAccountChange);

    return () => {
      p?.off?.("connect", onConnect);
      p?.off?.("disconnect", onDisconnect);
      p?.off?.("accountChanged", onAccountChange);
    };
  }, [loadBalance]);

  /* ---- Connect ---- */
  const connect = useCallback(async () => {
    const p = getPhantom();
    if (!p) { window.open("https://phantom.app", "_blank"); return; }
    setState((s) => ({ ...s, connecting: true }));
    try {
      const resp = await p.connect();
      const addr = resp.publicKey.toString();
      setState((s) => ({
        ...s,
        address: addr,
        connected: true,
        connecting: false,
        shortAddress: `${addr.slice(0, 4)}...${addr.slice(-4)}`,
      }));
      loadBalance(addr);
    } catch {
      setState((s) => ({ ...s, connecting: false }));
    }
  }, [loadBalance]);

  /* ---- Disconnect ---- */
  const disconnect = useCallback(async () => {
    await getPhantom()?.disconnect();
    setState((s) => ({
      ...s,
      address: null,
      connected: false,
      shortAddress: null,
      gnarpBalance: null,
    }));
  }, []);

  /* ---- Refresh balance manually ---- */
  const refreshBalance = useCallback(() => {
    if (state.address) loadBalance(state.address);
  }, [state.address, loadBalance]);

  /**
   * Transfer GNARP to any Solana address via Phantom signing.
   * DEMO_MODE = false → real on-chain transfer.
   * DEMO_MODE = true  → simulates without broadcasting.
   */
  const transferGnarp = useCallback(
    async (toAddress: string, amount: number) => {
      if (!state.address) throw new Error("钱包未连接");
      const result = await sendGnarpViaPhantom(state.address, toAddress, amount);
      // Refresh balance 3s after broadcast (allow chain confirmation)
      setTimeout(() => {
        if (state.address) loadBalance(state.address);
      }, 3000);
      return result;
    },
    [state.address, loadBalance],
  );

  return {
    ...state,
    connect,
    disconnect,
    refreshBalance,
    transferGnarp,
    DEMO_MODE,
    VAULT_IS_CONFIGURED,
  };
}
