import { getObject, getCoinMetadata } from '../services/suiService.js'
import { calculateRiskScore } from '../services/riskService.js'

export async function getTokenInfo(req, res) {
  const { address } = req.params
  try {
    const [object, metadata] = await Promise.allSettled([
      getObject(address),
      getCoinMetadata(address),
    ])
    res.json({
      success: true,
      data: {
        address,
        object: object.value || null,
        metadata: metadata.value || null,
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export async function analyzeToken(req, res) {
  const { address } = req.params
  try {
    const object = await getObject(address)
    const riskData = {
      devHolding: 0,
      liquidityLocked: false,
      mintAuthorityActive: true,
      liquidity: 0,
      topHolderPercent: 0,
      contractVerified: false,
      ageInDays: 1,
      devSelling: false,
    }
    const risk = calculateRiskScore(riskData)
    res.json({
      success: true,
      data: {
        address,
        object,
        ...risk,
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}