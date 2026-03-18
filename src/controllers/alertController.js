export async function getAlerts(req, res) {
  try {
    res.json({
      success: true,
      data: [
        { token: 'MOONCAT', risk: 'RUG', time: '2m ago', wallet: '0x4f2a...9c1d' },
        { token: 'SUIPEPE', risk: 'HIGH', time: '8m ago', wallet: '0x8b1c...3e2f' },
      ]
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}