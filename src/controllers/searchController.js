import { getTransaction, getWalletBalance, getObject } from '../services/suiService.js'

function detectQueryType(query) {
  if (query.length > 60) return 'token'
  if (query.startsWith('0x')) return 'wallet'
  return 'token'
}

export async function searchQuery(req, res) {
  const { q } = req.query
  if (!q) return res.status(400).json({ success: false, error: 'Query is required' })

  try {
    const type = detectQueryType(q)

    if (type === 'wallet') {
      const balance = await getWalletBalance(q)
      return res.json({
        success: true,
        type: 'wallet',
        data: { address: q, balances: balance }
      })
    }

    if (type === 'token') {
      const object = await getObject(q)
      return res.json({
        success: true,
        type: 'token',
        data: { address: q, object }
      })
    }

    const tx = await getTransaction(q)
    return res.json({
      success: true,
      type: 'transaction',
      data: tx
    })

  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}