export interface MRRCalculation {
  mrr: number
  tcv: number
}

export const calculateMRR = (
  regularPrice: number,
  discountPct: number,
  billingCycle: string,
  subscribersCount: number = 1
): MRRCalculation => {
  // Calculate discounted monthly price
  const discountedMonthlyPrice = regularPrice * (1 - discountPct / 100)
  
  // Determine contract length in months
  let contractLength: number
  
  switch (billingCycle.toLowerCase()) {
    case 'm':
    case 'monthly':
      contractLength = 1
      break
    case 'q':
    case 'quarterly':
      contractLength = 3
      break
    case 's-a':
    case 'semi-annual':
      contractLength = 6
      break
    case 'a':
    case 'annual':
      contractLength = 12
      break
    case 'biennial':
      contractLength = 24
      break
    case 'triennial':
      contractLength = 36
      break
    default:
      contractLength = 12 // Default to annual
  }
  
  // MRR is the discounted monthly price per subscriber
  const mrr = discountedMonthlyPrice * subscribersCount
  
  // TCV is the total amount paid upfront (monthly price * contract length * subscribers, with discount applied)
  const tcv = (discountedMonthlyPrice * contractLength) * subscribersCount
  
  return {
    mrr: Math.round(mrr * 100) / 100, // Round to 2 decimal places
    tcv: Math.round(tcv * 100) / 100
  }
}

export const calculateUpgradeDiff = (
  fromPlanPrice: number,
  toPlanPrice: number,
  discountPct: number,
  billingCycle: string,
  subscribersCount: number = 1
): MRRCalculation => {
  const fromCalculation = calculateMRR(fromPlanPrice, discountPct, billingCycle, subscribersCount)
  const toCalculation = calculateMRR(toPlanPrice, discountPct, billingCycle, subscribersCount)
  
  return {
    mrr: toCalculation.mrr - fromCalculation.mrr,
    tcv: toCalculation.tcv - fromCalculation.tcv
  }
}
