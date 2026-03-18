// Risk scoring engine for SUI RUG INTEL

// Weights for each risk factor
const RISK_WEIGHTS = {
  DEV_HOLDING_HIGH: 30,      // Dev holds > 20%
  DEV_HOLDING_MEDIUM: 15,    // Dev holds 10-20%
  NO_LIQUIDITY_LOCK: 25,     // Liquidity not locked
  MINT_AUTHORITY_ACTIVE: 20, // Can still mint tokens
  LOW_LIQUIDITY: 15,         // Liquidity < $50K
  HIGH_HOLDER_CONCENTRATION: 20, // Top 10 holders > 50%
  CONTRACT_UNVERIFIED: 10,   // Contract not verified
  NEW_CONTRACT: 10,          // Contract < 7 days old
  DEV_SELLING: 25,           // Dev actively selling
  LIQUIDITY_REMOVED: 50,     // Liquidity already removed
}

export function calculateRiskScore(data) {
  let score = 0
  const flags = []
  const checks = []

  // Dev holding check
  const devHolding = parseFloat(data.devHolding || 0)
  if (devHolding > 20) {
    score += RISK_WEIGHTS.DEV_HOLDING_HIGH
    flags.push('Dev wallet holds more than 20% of supply')
    checks.push({ label: 'Dev Holding < 20%', passed: false, info: `Dev holds ${devHolding}%` })
  } else if (devHolding > 10) {
    score += RISK_WEIGHTS.DEV_HOLDING_MEDIUM
    flags.push('Dev wallet holds more than 10% of supply')
    checks.push({ label: 'Dev Holding < 20%', passed: false, info: `Dev holds ${devHolding}%` })
  } else {
    checks.push({ label: 'Dev Holding < 20%', passed: true, info: `Dev holds ${devHolding}%` })
  }

  // Liquidity lock check
  if (!data.liquidityLocked) {
    score += RISK_WEIGHTS.NO_LIQUIDITY_LOCK
    flags.push('Liquidity is not locked')
    checks.push({ label: 'Liquidity Locked', passed: false, info: 'No liquidity lock detected' })
  } else {
    checks.push({ label: 'Liquidity Locked', passed: true, info: 'Liquidity is locked' })
  }

  // Mint authority check
  if (data.mintAuthorityActive) {
    score += RISK_WEIGHTS.MINT_AUTHORITY_ACTIVE
    flags.push('Mint authority is still active')
    checks.push({ label: 'Mint Authority Disabled', passed: false, info: 'Dev can still mint tokens' })
  } else {
    checks.push({ label: 'Mint Authority Disabled', passed: true, info: 'Mint authority is disabled' })
  }

  // Liquidity check
  const liquidity = parseFloat(data.liquidity || 0)
  if (liquidity === 0) {
    score += RISK_WEIGHTS.LIQUIDITY_REMOVED
    flags.push('Liquidity has been fully removed')
    checks.push({ label: 'Liquidity > $50K', passed: false, info: 'Liquidity fully drained' })
  } else if (liquidity < 50000) {
    score += RISK_WEIGHTS.LOW_LIQUIDITY
    flags.push('Liquidity is below $50K')
    checks.push({ label: 'Liquidity > $50K', passed: false, info: `Only $${liquidity} in liquidity` })
  } else {
    checks.push({ label: 'Liquidity > $50K', passed: true, info: `$${liquidity} in liquidity` })
  }

  // Holder concentration check
  const topHolderPercent = parseFloat(data.topHolderPercent || 0)
  if (topHolderPercent > 50) {
    score += RISK_WEIGHTS.HIGH_HOLDER_CONCENTRATION
    flags.push('Top 10 holders control more than 50% of supply')
    checks.push({ label: 'Top 10 Holders < 50%', passed: false, info: `Top holders control ${topHolderPercent}%` })
  } else {
    checks.push({ label: 'Top 10 Holders < 50%', passed: true, info: `Top holders control ${topHolderPercent}%` })
  }

  // Contract verified check
  if (!data.contractVerified) {
    score += RISK_WEIGHTS.CONTRACT_UNVERIFIED
    flags.push('Contract source code is not verified')
    checks.push({ label: 'Contract Verified', passed: false, info: 'Source code not verified on-chain' })
  } else {
    checks.push({ label: 'Contract Verified', passed: true, info: 'Contract is verified' })
  }

  // New contract check
  const ageInDays = data.ageInDays || 0
  if (ageInDays < 7) {
    score += RISK_WEIGHTS.NEW_CONTRACT
    flags.push(`Contract is only ${ageInDays} days old`)
    checks.push({ label: 'Contract Age > 7 Days', passed: false, info: `Only ${ageInDays} days old` })
  } else {
    checks.push({ label: 'Contract Age > 7 Days', passed: true, info: `${ageInDays} days old` })
  }

  // Dev selling check
  if (data.devSelling) {
    score += RISK_WEIGHTS.DEV_SELLING
    flags.push('Dev wallet is actively selling')
    checks.push({ label: 'Dev Not Selling', passed: false, info: 'Dev wallet detected selling' })
  } else {
    checks.push({ label: 'Dev Not Selling', passed: true, info: 'No dev selling detected' })
  }

  // Cap score at 100
  score = Math.min(score, 100)

  // Determine verdict
  let verdict = 'SAFE'
  let riskLevel = 'LOW'
  if (score >= 80) { verdict = 'RUG RISK'; riskLevel = 'RUG' }
  else if (score >= 60) { verdict = 'HIGH RISK'; riskLevel = 'HIGH' }
  else if (score >= 40) { verdict = 'MEDIUM RISK'; riskLevel = 'MEDIUM' }
  else if (score >= 20) { verdict = 'LOW RISK'; riskLevel = 'LOW' }

  return { score, verdict, riskLevel, flags, checks }
}

export function isRugPattern(transactions) {
  if (!transactions || transactions.length === 0) return false
  const recentTxns = transactions.slice(0, 10)
  const largeSells = recentTxns.filter(tx =>
    tx.type === 'SELL' && parseFloat(tx.amount) > 10000
  )
  return largeSells.length >= 3
}