import { getWalletBalance, getWalletTransactions } from '../services/suiService.js'

export async function getWalletInfo(req, res) {
  const { address } = req.params
  try {
    const [balance, transactions] = await Promise.allSettled([
      getWalletBalance(address),
      getWalletTransactions(address),
    ])
    res.json({
      success: true,
      data: {
        address,
        balance: balance.value || [],
        transactions: transactions.value || [],
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}