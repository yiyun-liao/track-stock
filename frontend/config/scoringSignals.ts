/**
 * Scoring Signals Configuration
 * Defines all text descriptions for trading signals and recommendations
 * Backend returns only numerical scores, frontend maps them to text
 */

export const SIGNAL_DESCRIPTIONS = {
  technical: {
    strong: {
      emoji: '✅',
      text: '技术面强势看涨',
      color: 'text-green-600',
    },
    weak: {
      emoji: '⚠️',
      text: '技术面走弱',
      color: 'text-red-600',
    },
  },
  fundamental: {
    good: {
      emoji: '✅',
      text: '基本面良好',
      color: 'text-green-600',
    },
    poor: {
      emoji: '⚠️',
      text: '基本面较弱',
      color: 'text-red-600',
    },
  },
  sentiment: {
    positive: {
      emoji: '✅',
      text: '市场情绪积极',
      color: 'text-green-600',
    },
    negative: {
      emoji: '⚠️',
      text: '市场情绪消极',
      color: 'text-red-600',
    },
  },
}

export const ACTION_RECOMMENDATIONS = {
  strong_buy: {
    threshold: 8,
    text: '强烈建议：买入',
    color: 'text-green-700',
  },
  buy: {
    threshold: 7,
    text: '建议：买入或加仓',
    color: 'text-green-600',
  },
  hold: {
    threshold: 5.5,
    text: '建议：持有或观望',
    color: 'text-amber-600',
  },
  reduce: {
    threshold: 4,
    text: '建议：考虑减仓',
    color: 'text-red-600',
  },
  strong_sell: {
    threshold: 0,
    text: '强烈建议：卖出',
    color: 'text-red-700',
  },
}

/**
 * Get action recommendation based on overall score
 */
export function getActionRecommendation(score: number) {
  if (score >= ACTION_RECOMMENDATIONS.strong_buy.threshold) {
    return ACTION_RECOMMENDATIONS.strong_buy
  }
  if (score >= ACTION_RECOMMENDATIONS.buy.threshold) {
    return ACTION_RECOMMENDATIONS.buy
  }
  if (score >= ACTION_RECOMMENDATIONS.hold.threshold) {
    return ACTION_RECOMMENDATIONS.hold
  }
  if (score >= ACTION_RECOMMENDATIONS.reduce.threshold) {
    return ACTION_RECOMMENDATIONS.reduce
  }
  return ACTION_RECOMMENDATIONS.strong_sell
}

/**
 * Generate signal descriptions from signal conditions
 */
export function generateSignalDescriptions(signalConditions: Record<string, boolean>) {
  const signals = []

  if (signalConditions.technical_strong) {
    signals.push({
      type: 'technical',
      ...SIGNAL_DESCRIPTIONS.technical.strong,
    })
  } else if (signalConditions.technical_weak) {
    signals.push({
      type: 'technical',
      ...SIGNAL_DESCRIPTIONS.technical.weak,
    })
  }

  if (signalConditions.fundamental_good) {
    signals.push({
      type: 'fundamental',
      ...SIGNAL_DESCRIPTIONS.fundamental.good,
    })
  } else if (signalConditions.fundamental_poor) {
    signals.push({
      type: 'fundamental',
      ...SIGNAL_DESCRIPTIONS.fundamental.poor,
    })
  }

  if (signalConditions.sentiment_positive) {
    signals.push({
      type: 'sentiment',
      ...SIGNAL_DESCRIPTIONS.sentiment.positive,
    })
  } else if (signalConditions.sentiment_negative) {
    signals.push({
      type: 'sentiment',
      ...SIGNAL_DESCRIPTIONS.sentiment.negative,
    })
  }

  return signals
}
