import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const SUI_RPC = process.env.SUI_RPC_URL || 'https://fullnode.mainnet.sui.io'

// Base RPC call function
async function rpcCall(method, params = []) {
  try {
    const response = await axios.post(SUI_RPC, {
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    })
    return response.data.result
  } catch (error) {
    console.error(`RPC Error [${method}]:`, error.message)
    throw error
  }
}

// Get transaction details
export async function getTransaction(txHash) {
  return rpcCall('sui_getTransactionBlock', [
    txHash,
    {
      showInput: true,
      showEffects: true,
      showEvents: true,
      showObjectChanges: true,
    }
  ])
}

// Get wallet balance and objects
export async function getWalletBalance(address) {
  return rpcCall('suix_getAllBalances', [address])
}

// Get wallet transactions
export async function getWalletTransactions(address) {
  return rpcCall('suix_queryTransactionBlocks', [
    {
      filter: { FromAddress: address },
      options: {
        showInput: true,
        showEffects: true,
      }
    },
    null,
    20,
    true,
  ])
}

// Get object details (token/contract)
export async function getObject(objectId) {
  return rpcCall('sui_getObject', [
    objectId,
    {
      showType: true,
      showOwner: true,
      showContent: true,
      showDisplay: true,
    }
  ])
}

// Get coin metadata
export async function getCoinMetadata(coinType) {
  return rpcCall('suix_getCoinMetadata', [coinType])
}

// Get total supply
export async function getTotalSupply(coinType) {
  return rpcCall('suix_getTotalSupply', [coinType])
}

// Get latest checkpoint (for network stats)
export async function getLatestCheckpoint() {
  return rpcCall('sui_getLatestCheckpointSequenceNumber', [])
}

// Get network metrics
export async function getNetworkMetrics() {
  try {
    const [checkpoint] = await Promise.all([
      getLatestCheckpoint(),
    ])
    return { checkpoint }
  } catch (error) {
    console.error('Network metrics error:', error.message)
    return null
  }
}

// Get coins owned by address
export async function getCoinsOwnedByAddress(address) {
  return rpcCall('suix_getAllCoins', [address, null, 50])
}

// DexScreener API
export async function getDexScreenerTokens() {
  try {
    const response = await axios.get(
      'https://api.dexscreener.com/latest/dex/search?q=SUI',
      { timeout: 10000 }
    )
    return response.data
  } catch (error) {
    console.error('DexScreener error:', error.message)
    return null
  }
}

export async function getDexScreenerToken(address) {
  try {
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      { timeout: 10000 }
    )
    return response.data
  } catch (error) {
    console.error('DexScreener token error:', error.message)
    return null
  }
}

export async function searchDexScreener(query) {
  try {
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/search?q=${query}`,
      { timeout: 10000 }
    )
    return response.data
  } catch (error) {
    console.error('DexScreener search error:', error.message)
    return null
  }
}