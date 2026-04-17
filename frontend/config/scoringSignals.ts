/**
 * Scoring Signals Configuration
 * Defines all text descriptions for trading signals and recommendations
 * Backend returns only numerical scores, frontend maps them to text
 */

export const SIGNAL_DESCRIPTIONS = {
  technical: {
    strong: {
      emoji: '✅',
      text: '技術面強勢看漲',
      color: 'text-green-600',
    },
    weak: {
      emoji: '⚠️',
      text: '技術面走弱',
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
      text: '基本面較弱',
      color: 'text-red-600',
    },
  },
  sentiment: {
    positive: {
      emoji: '✅',
      text: '市場情緒積極',
      color: 'text-green-600',
    },
    negative: {
      emoji: '⚠️',
      text: '市場情緒消極',
      color: 'text-red-600',
    },
  },
}

export const ACTION_RECOMMENDATIONS = {
  strong_buy: {
    threshold: 8,
    text: '強烈建議：買入',
    color: 'text-green-700',
  },
  buy: {
    threshold: 7,
    text: '建議：買入或加倉',
    color: 'text-green-600',
  },
  hold: {
    threshold: 5.5,
    text: '建議：持有或觀望',
    color: 'text-amber-600',
  },
  reduce: {
    threshold: 4,
    text: '建議：考慮減倉',
    color: 'text-red-600',
  },
  strong_sell: {
    threshold: 0,
    text: '強烈建議：賣出',
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
 * Signal thresholds - customize here to change signal conditions
 */
const SIGNAL_THRESHOLDS = {
  technical: {
    strong: 70,      // technical_score > 70
    weak: 30,        // technical_score < 30
  },
  fundamental: {
    good: 70,        // fundamental_score > 70
    poor: 40,        // fundamental_score < 40
  },
  sentiment: {
    positive: 70,    // sentiment_score > 70
    negative: 30,    // sentiment_score < 30
  },
}

/**
 * Generate signal descriptions from scores
 * All condition logic is frontend-based, making it easy to customize
 */
export function generateSignalDescriptions(scores: {
  technical_score: number
  fundamental_score: number
  sentiment_score: number
}) {
  const signals = []

  // Technical signals
  if (scores.technical_score > SIGNAL_THRESHOLDS.technical.strong) {
    signals.push({
      type: 'technical',
      ...SIGNAL_DESCRIPTIONS.technical.strong,
    })
  } else if (scores.technical_score < SIGNAL_THRESHOLDS.technical.weak) {
    signals.push({
      type: 'technical',
      ...SIGNAL_DESCRIPTIONS.technical.weak,
    })
  }

  // Fundamental signals
  if (scores.fundamental_score > SIGNAL_THRESHOLDS.fundamental.good) {
    signals.push({
      type: 'fundamental',
      ...SIGNAL_DESCRIPTIONS.fundamental.good,
    })
  } else if (scores.fundamental_score < SIGNAL_THRESHOLDS.fundamental.poor) {
    signals.push({
      type: 'fundamental',
      ...SIGNAL_DESCRIPTIONS.fundamental.poor,
    })
  }

  // Sentiment signals
  if (scores.sentiment_score > SIGNAL_THRESHOLDS.sentiment.positive) {
    signals.push({
      type: 'sentiment',
      ...SIGNAL_DESCRIPTIONS.sentiment.positive,
    })
  } else if (scores.sentiment_score < SIGNAL_THRESHOLDS.sentiment.negative) {
    signals.push({
      type: 'sentiment',
      ...SIGNAL_DESCRIPTIONS.sentiment.negative,
    })
  }

  return signals
}
