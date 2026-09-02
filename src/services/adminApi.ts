export interface TreasuryVault {
  id: string;
  chain: string;
  asset: string;
  receivingAddress: string;
  coldSweepAddress: string;
  minDepositUsd: number;
  sweepThresholdUsd: number;
  currentBalanceUsd: number;
  isActive: boolean;
  updatedAt: string;
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  type: 'CRYPTO_DIRECT' | 'WEB3_WALLET' | 'STRIPE_FIAT';
  isEnabled: boolean;
  isKmsSealed?: boolean;
  maskedPublishableKey?: string;
  details: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'trader' | 'sandbox';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  activeBotsCount: number;
  totalVolumeUsd: number;
  createdAt: string;
}

export interface FleetBot {
  id: string;
  userId: string;
  label: string;
  strategy: string;
  symbol: string;
  status: 'RUNNING' | 'SOFT_STOPPING' | 'STOPPED' | 'ERROR';
  activeOrders: number;
  unrealizedPnlUsd: number;
  startedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  action: string;
  target: string;
  prevHash: string;
  currentHash: string;
  ipAddress: string;
}

export interface SystemStats {
  activeBotsCount: number;
  totalVolume24hUsd: number;
  pendingSweepUsd: number;
  gatewayStatus: 'HEALTHY' | 'DEGRADED';
  kafkaLag: number;
  dbConnections: number;
  redisMemoryMb: number;
}

// Initial Mock Datasets for standalone back-office operation with real persistence in localStorage
export const INITIAL_VAULTS: TreasuryVault[] = [
  {
    id: 'vault-trc20',
    chain: 'TRON (TRC20)',
    asset: 'USDT',
    receivingAddress: 'TLv9nSmL1VemB31bN5k3z9fH8E8qZ1v9nM',
    coldSweepAddress: 'TXYZ99MultiSigColdStorageVaultTRC20',
    minDepositUsd: 10,
    sweepThresholdUsd: 2500,
    currentBalanceUsd: 1420.5,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vault-erc20',
    chain: 'Ethereum (ERC20)',
    asset: 'USDT',
    receivingAddress: '0x71C0Ff3D408E97C2fCE5fC9b59C3E569C8E82245',
    coldSweepAddress: '0x123456789012345678901234567890123456ColdSafe',
    minDepositUsd: 50,
    sweepThresholdUsd: 5000,
    currentBalanceUsd: 3840.0,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vault-sol',
    chain: 'Solana (SPL)',
    asset: 'USDT',
    receivingAddress: 'VnmZ4J9eK2bYQ8eT7w3zN1k5j6r9mX4s2v1pL9bK2mQ',
    coldSweepAddress: 'SolColdSquadsMultiSigVaultAddress8899',
    minDepositUsd: 10,
    sweepThresholdUsd: 1500,
    currentBalanceUsd: 620.0,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vault-arbitrum',
    chain: 'Arbitrum One',
    asset: 'USDT',
    receivingAddress: '0x71C0Ff3D408E97C2fCE5fC9b59C3E569C8E82245',
    coldSweepAddress: '0xArbitrumMultiSigColdGnosisSafe9999',
    minDepositUsd: 10,
    sweepThresholdUsd: 2000,
    currentBalanceUsd: 890.0,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_PAYMENTS: PaymentGatewayConfig[] = [
  {
    id: 'pay-crypto-direct',
    name: 'Direct Crypto QR & Address Transfer',
    type: 'CRYPTO_DIRECT',
    isEnabled: true, // Default ON
    details: 'Supports USDT on TRC20, ERC20, Arbitrum, Solana with zero gateway fees.',
  },
  {
    id: 'pay-web3-wallet',
    name: 'Web3 Wallet Transaction Signing',
    type: 'WEB3_WALLET',
    isEnabled: true, // Default ON
    details: 'Browser extension signing via MetaMask, Trust Wallet, Rabby.',
  },
  {
    id: 'pay-stripe-fiat',
    name: 'Stripe Credit / Debit Card Gateway',
    type: 'STRIPE_FIAT',
    isEnabled: false, // Default OFF as requested
    isKmsSealed: false,
    details: 'Credit card fiat processing. Requires KMS-sealed API key configuration.',
  },
];

export const adminApi = {
  getSystemStats: async (): Promise<SystemStats> => {
    return {
      activeBotsCount: 38,
      totalVolume24hUsd: 1845920.0,
      pendingSweepUsd: 6770.5,
      gatewayStatus: 'HEALTHY',
      kafkaLag: 0,
      dbConnections: 14,
      redisMemoryMb: 42.8,
    };
  },

  getTreasuryVaults: async (): Promise<TreasuryVault[]> => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_vaults');
      if (saved) return JSON.parse(saved);
    }
    return INITIAL_VAULTS;
  },

  saveTreasuryVault: async (vault: TreasuryVault): Promise<void> => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_vaults');
      const list: TreasuryVault[] = saved ? JSON.parse(saved) : [...INITIAL_VAULTS];
      const idx = list.findIndex((v) => v.id === vault.id);
      if (idx >= 0) list[idx] = vault;
      else list.push(vault);
      localStorage.setItem('vf_admin_vaults', JSON.stringify(list));
    }
  },

  getPaymentGateways: async (): Promise<PaymentGatewayConfig[]> => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_payments');
      if (saved) return JSON.parse(saved);
    }
    return INITIAL_PAYMENTS;
  },

  savePaymentGateway: async (config: PaymentGatewayConfig): Promise<void> => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_payments');
      const list: PaymentGatewayConfig[] = saved ? JSON.parse(saved) : [...INITIAL_PAYMENTS];
      const idx = list.findIndex((p) => p.id === config.id);
      if (idx >= 0) list[idx] = config;
      else list.push(config);
      localStorage.setItem('vf_admin_payments', JSON.stringify(list));
    }
  },

  getUsers: async (): Promise<AdminUser[]> => {
    return [
      {
        id: 'usr_admin_master',
        email: 'security-admin@venom.finance',
        role: 'super_admin',
        status: 'ACTIVE',
        activeBotsCount: 3,
        totalVolumeUsd: 84000,
        createdAt: '2026-08-01T10:00:00Z',
      },
      {
        id: 'usr_alpha_1',
        email: 'trader.alpha@hedge.fund',
        role: 'trader',
        status: 'ACTIVE',
        activeBotsCount: 12,
        totalVolumeUsd: 492000,
        createdAt: '2026-08-15T14:30:00Z',
      },
      {
        id: 'usr_suspicious_bot',
        email: 'scanner99@anonymous.io',
        role: 'trader',
        status: 'SUSPENDED',
        activeBotsCount: 0,
        totalVolumeUsd: 1200,
        createdAt: '2026-09-01T08:12:00Z',
      },
    ];
  },

  getFleetBots: async (): Promise<FleetBot[]> => {
    return [
      {
        id: 'bot_fl_1',
        userId: 'usr_alpha_1',
        label: 'BTC Alpha Grid Core',
        strategy: 'SPOT_GRID',
        symbol: 'BTCUSDT',
        status: 'RUNNING',
        activeOrders: 32,
        unrealizedPnlUsd: 142.5,
        startedAt: '2026-08-28T12:00:00Z',
      },
      {
        id: 'bot_fl_2',
        userId: 'usr_alpha_1',
        label: 'SOL 10x Momentum',
        strategy: 'FUTURES_GRID',
        symbol: 'SOLUSDT',
        status: 'RUNNING',
        activeOrders: 24,
        unrealizedPnlUsd: 380.0,
        startedAt: '2026-08-30T09:15:00Z',
      },
    ];
  },
};
