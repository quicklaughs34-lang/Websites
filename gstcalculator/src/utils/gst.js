export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

export function calculateGst(amount, rate, mode) {
  if (!Number.isFinite(amount) || amount < 0) {
    return { gstAmount: 0, finalAmount: 0 }
  }

  if (mode === 'remove') {
    const baseAmount = amount / (1 + rate / 100)
    const gstAmount = amount - baseAmount

    return {
      gstAmount,
      finalAmount: baseAmount,
    }
  }

  const gstAmount = amount * (rate / 100)

  return {
    gstAmount,
    finalAmount: amount + gstAmount,
  }
}
