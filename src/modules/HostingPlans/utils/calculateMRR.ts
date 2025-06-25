
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
  // Calculate discounted price
  const discountedPrice = regularPrice * (1 - discountPct / 100)
  
  // Convert to monthly recurring revenue based on billing cycle
  let monthlyPrice: number
  let contractLength: number // in months
  
  switch (billingCycle.toLowerCase()) {
    case 'm':
    case 'monthly':
      monthlyPrice = discountedPrice
      contractLength = 1
      break
    case 'q':
    case 'quarterly':
      monthlyPrice = discountedPrice / 3
      contractLength = 3
      break
    case 's-a':
    case 'semi-annual':
      monthlyPrice = discountedPrice / 6
      contractLength = 6
      break
    case 'a':
    case 'annual':
      monthlyPrice = discountedPrice / 12
      contractLength = 12
      break
    case 'biennial':
      monthlyPrice = discountedPrice / 24
      contractLength = 24
      break
    case 'triennial':
      monthlyPrice = discountedPrice / 36
      contractLength = 36
      break
    default:
      monthlyPrice = discountedPrice / 12 // Default to annual
      contractLength = 12
  }
  
  const mrr = monthlyPrice * subscribersCount
  const tcv = discountedPrice * subscribersCount
  
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
