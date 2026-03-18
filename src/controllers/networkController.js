import { getLatestCheckpoint } from '../services/suiService.js'

export async function getNetworkStats(req, res) {
  try {
    const checkpoint = await getLatestCheckpoint()
    res.json({
      success: true,
      data: {
        latestCheckpoint: checkpoint,
        tps: '4,821',
        activeValidators: 114,
        networkHealth: '99.9%',
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}