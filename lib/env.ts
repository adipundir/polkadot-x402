/**
 * Environment variable validation and configuration
 * Validates required environment variables and provides type-safe access
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid number for environment variable: ${key}`);
  }
  return parsed;
}

export const env = {
  // Required
  EVM_PRIVATE_KEY: requireEnv('EVM_PRIVATE_KEY'),
  
  // Optional with defaults
  RPC_URL: getEnv('RPC_URL', 'https://testnet-passet-hub-eth-rpc.polkadot.io'),
  NETWORK: getEnv('NETWORK', 'polkadot-hub-testnet'),
  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),
  
  // Custom chain configuration (optional, for custom EVM chains)
  CHAIN_ID: getEnvNumber('CHAIN_ID', 0), // 0 means use default for network
  CHAIN_NAME: getEnv('CHAIN_NAME', ''),
  CHAIN_RPC_URL: getEnv('CHAIN_RPC_URL', ''),
  NATIVE_CURRENCY_NAME: getEnv('NATIVE_CURRENCY_NAME', 'ETH'),
  NATIVE_CURRENCY_SYMBOL: getEnv('NATIVE_CURRENCY_SYMBOL', 'ETH'),
  NATIVE_CURRENCY_DECIMALS: getEnvNumber('NATIVE_CURRENCY_DECIMALS', 18),
  
  // Gas configuration
  GAS_LIMIT: getEnv('GAS_LIMIT', ''),
  GAS_PRICE_MULTIPLIER: parseFloat(getEnv('GAS_PRICE_MULTIPLIER', '1.0')),
};

// Validate private key format
if (!env.EVM_PRIVATE_KEY.startsWith('0x')) {
  throw new Error('EVM_PRIVATE_KEY must start with 0x');
}

if (env.EVM_PRIVATE_KEY.length !== 66) {
  throw new Error('EVM_PRIVATE_KEY must be 66 characters (0x + 64 hex chars)');
}

