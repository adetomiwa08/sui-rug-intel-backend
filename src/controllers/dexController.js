import { getDexScreenerTokens, getDexScreenerToken, searchDexScreener } from '../services/suiService.js'

export async function getTopTokens(req, res) {
  try {
    const data = await getDexScreenerTokens()
    if (!data || !data.pairs) {
      return res.json({ success: true, data: [] })
    }

    // Filter SUI pairs only, sort by volume
    const suiPairs = data.pairs
      .filter(p => p.chainId === 'sui' && p.liquidity?.usd > 1000)
      .sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
      .slice(0, 20)
      .map(p => ({
        symbol: p.baseToken?.symbol || '---',
        name: p.baseToken?.name || '---',
        address: p.baseToken?.address || '---',
        price: p.priceUsd ? `$${parseFloat(p.priceUsd).toFixed(6)}` : '$0',
        priceRaw: parseFloat(p.priceUsd) || 0,
        change24h: p.priceChange?.h24 ? `${p.priceChange.h24 > 0 ? '+' : ''}${p.priceChange.h24.toFixed(2)}%` : '0%',
        positive: (p.priceChange?.h24 || 0) >= 0,
        volume24h: p.volume?.h24 ? `$${formatNumber(p.volume.h24)}` : '$0',
        marketCap: p.marketCap ? `$${formatNumber(p.marketCap)}` : 'N/A',
        fdv: p.fdv ? `$${formatNumber(p.fdv)}` : 'N/A',
        liquidity: p.liquidity?.usd ? `$${formatNumber(p.liquidity.usd)}` : '$0',
        liquidityRaw: p.liquidity?.usd || 0,
        txns24h: ((p.txns?.h24?.buys || 0) + (p.txns?.h24?.sells || 0)).toLocaleString(),
        pairAddress: p.pairAddress,
        dexId: p.dexId,
        url: p.url,
        imageUrl: p.info?.imageUrl || null,
        websites: p.info?.websites || [],
        socials: p.info?.socials || [],
        buys24h: p.txns?.h24?.buys || 0,
        sells24h: p.txns?.h24?.sells || 0,
      }))

    res.json({ success: true, data: suiPairs })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export async function getTokenByAddress(req, res) {
  try {
    const { address } = req.params
    const data = await getDexScreenerToken(address)
    if (!data || !data.pairs || data.pairs.length === 0) {
      return res.json({ success: false, error: 'Token not found' })
    }

    const p = data.pairs[0]
    const token = {
      symbol: p.baseToken?.symbol || '---',
      name: p.baseToken?.name || '---',
      address: p.baseToken?.address || address,
      price: p.priceUsd ? `$${parseFloat(p.priceUsd).toFixed(6)}` : '$0',
      priceRaw: parseFloat(p.priceUsd) || 0,
      change24h: p.priceChange?.h24 ? `${p.priceChange.h24 > 0 ? '+' : ''}${p.priceChange.h24.toFixed(2)}%` : '0%',
      positive: (p.priceChange?.h24 || 0) >= 0,
      volume24h: p.volume?.h24 ? `$${formatNumber(p.volume.h24)}` : '$0',
      marketCap: p.marketCap ? `$${formatNumber(p.marketCap)}` : 'N/A',
      fdv: p.fdv ? `$${formatNumber(p.fdv)}` : 'N/A',
      liquidity: p.liquidity?.usd ? `$${formatNumber(p.liquidity.usd)}` : '$0',
      liquidityRaw: p.liquidity?.usd || 0,
      txns24h: ((p.txns?.h24?.buys || 0) + (p.txns?.h24?.sells || 0)).toLocaleString(),
      pairAddress: p.pairAddress,
      dexId: p.dexId,
      url: p.url,
      imageUrl: p.info?.imageUrl || null,
      websites: p.info?.websites || [],
      socials: p.info?.socials || [],
      buys24h: p.txns?.h24?.buys || 0,
      sells24h: p.txns?.h24?.sells || 0,
      priceHistory: data.pairs.map(pair => ({
        time: pair.pairCreatedAt,
        price: parseFloat(pair.priceUsd) || 0,
      })),
    }

    res.json({ success: true, data: token })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export async function searchTokens(req, res) {
  try {
    const { q } = req.query
    if (!q) return res.status(400).json({ success: false, error: 'Query required' })

    const data = await searchDexScreener(q)
    if (!data || !data.pairs) {
      return res.json({ success: true, data: [] })
    }

    const results = data.pairs
      .filter(p => p.chainId === 'sui')
      .slice(0, 10)
      .map(p => ({
        symbol: p.baseToken?.symbol || '---',
        name: p.baseToken?.name || '---',
        address: p.baseToken?.address || '---',
        price: p.priceUsd ? `$${parseFloat(p.priceUsd).toFixed(6)}` : '$0',
        change24h: p.priceChange?.h24 ? `${p.priceChange.h24 > 0 ? '+' : ''}${p.priceChange.h24.toFixed(2)}%` : '0%',
        positive: (p.priceChange?.h24 || 0) >= 0,
        volume24h: p.volume?.h24 ? `$${formatNumber(p.volume.h24)}` : '$0',
        marketCap: p.marketCap ? `$${formatNumber(p.marketCap)}` : 'N/A',
        liquidity: p.liquidity?.usd ? `$${formatNumber(p.liquidity.usd)}` : '$0',
        liquidityRaw: p.liquidity?.usd || 0,
        imageUrl: p.info?.imageUrl || null,
        url: p.url,
        pairAddress: p.pairAddress,
      }))

    res.json({ success: true, data: results })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

function formatNumber(num) {
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
  return num.toFixed(2)
}