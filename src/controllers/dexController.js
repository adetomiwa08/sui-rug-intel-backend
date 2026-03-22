import { getDexScreenerTokens, getDexScreenerToken, searchDexScreener, getCoinGeckoSuiTokens } from '../services/suiService.js'

function formatNumber(num) {
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
  return num.toFixed(2)
}

export async function getTopTokens(req, res) {
  try {
    const [dexData, geckoData] = await Promise.allSettled([
      getDexScreenerTokens(),
      getCoinGeckoSuiTokens(),
    ])

    const seen = new Map()

    if (dexData.status === 'fulfilled' && dexData.value?.pairs) {
      dexData.value.pairs
        .filter(p => p.chainId === 'sui' && p.liquidity?.usd > 0)
        .forEach(p => {
          const addr = p.baseToken?.address
          if (!addr) return
          seen.set(addr, {
            symbol: p.baseToken?.symbol || '---',
            name: p.baseToken?.name || '---',
            address: addr,
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
            source: 'dexscreener',
          })
        })
    }

    if (geckoData.status === 'fulfilled' && geckoData.value) {
      geckoData.value.forEach(t => {
        const key = `gecko_${t.id}`
        if (seen.has(key)) return
        const change = t.price_change_percentage_24h || 0
        seen.set(key, {
          symbol: t.symbol?.toUpperCase() || '---',
          name: t.name || '---',
          address: key,
          price: t.current_price ? `$${t.current_price < 0.001 ? t.current_price.toExponential(2) : t.current_price.toLocaleString()}` : '$0',
          priceRaw: t.current_price || 0,
          change24h: `${change > 0 ? '+' : ''}${change.toFixed(2)}%`,
          positive: change >= 0,
          volume24h: t.total_volume ? `$${formatNumber(t.total_volume)}` : '$0',
          marketCap: t.market_cap ? `$${formatNumber(t.market_cap)}` : 'N/A',
          fdv: t.fully_diluted_valuation ? `$${formatNumber(t.fully_diluted_valuation)}` : 'N/A',
          liquidity: 'N/A',
          liquidityRaw: t.market_cap || 0,
          txns24h: 'N/A',
          pairAddress: null,
          dexId: 'coingecko',
          url: `https://www.coingecko.com/en/coins/${t.id}`,
          imageUrl: t.image || null,
          websites: [],
          socials: [],
          buys24h: 0,
          sells24h: 0,
          source: 'coingecko',
          geckoId: t.id,
          ath: t.ath,
          athChangePercent: t.ath_change_percentage,
        })
      })
    }

    const results = Array.from(seen.values())
      .sort((a, b) => {
        const aVol = parseFloat(a.volume24h?.replace(/[^0-9.]/g, '') || 0)
        const bVol = parseFloat(b.volume24h?.replace(/[^0-9.]/g, '') || 0)
        return bVol - aVol
      })

    res.json({ success: true, data: results })
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

export async function getRuggedTokens(req, res) {
  try {
    const geckoData = await getCoinGeckoSuiTokens()

    if (!geckoData) {
      return res.json({ success: true, data: [] })
    }

    const rugged = geckoData
      .filter(t => {
        const athDrop = Math.abs(t.ath_change_percentage || 0)
        const volume = t.total_volume || 0
        const price = t.current_price || 0
        const marketCap = t.market_cap || 0

        // Deeply dead — down 95%+ AND almost no trading activity
        const deeplyDead = athDrop >= 95 && volume < 50000
        // Essentially worthless — price near zero with no activity
        const essentiallyDead = athDrop >= 90 && volume < 5000 && price < 0.001
        // Abandoned project — massive drop with tiny remaining market cap
        const abandonedProject = athDrop >= 97 && marketCap < 500000

        return deeplyDead || essentiallyDead || abandonedProject
      })
      .map(t => {
        const athDrop = Math.abs(t.ath_change_percentage || 0)
        const rugScore = Math.min(99, Math.round(athDrop * 0.95))
        const causeOfDeath = athDrop >= 99 ? 'Liquidity Drain'
          : athDrop >= 97 ? 'Dev Dump'
          : athDrop >= 95 ? 'Honeypot'
          : 'Mint Attack'

        return {
          id: t.id,
          token: t.symbol?.toUpperCase(),
          name: t.name,
          imageUrl: t.image,
          dateDied: t.ath_date ? new Date(t.ath_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
          causeOfDeath,
          liquidityStolen: t.market_cap ? `$${formatNumber(t.market_cap)}` : 'Unknown',
          peakMcap: t.ath && t.circulating_supply ? `$${formatNumber(t.ath * t.circulating_supply)}` : 'Unknown',
          currentPrice: t.current_price ? `$${t.current_price}` : '$0',
          athDrop: `-${athDrop.toFixed(1)}%`,
          rugScore,
          holders: 'N/A',
          devWallet: 'N/A',
          description: `${t.name} (${t.symbol?.toUpperCase()}) collapsed ${athDrop.toFixed(0)}% from its all-time high of $${t.ath}. Current price is $${t.current_price}. Classic signs of an abandoned or rugged project.`,
          txHash: 'N/A',
          rip: `💀 Down ${athDrop.toFixed(0)}% from ATH`,
          geckoUrl: `https://www.coingecko.com/en/coins/${t.id}`,
        }
      })
      .sort((a, b) => b.rugScore - a.rugScore)

    res.json({ success: true, data: rugged })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}