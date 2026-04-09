import React from 'react'
import { useStockScoring, type ScoringData, type ScoringConfig } from '@/lib/hooks/useStockScoring'
import { generateSignalDescriptions, getActionRecommendation } from '@/config/scoringSignals'

interface ScoringCardProps {
  symbol: string
}

const ScoringCard: React.FC<ScoringCardProps> = ({ symbol }) => {
  const { data, config, loading, error } = useStockScoring(symbol, true)

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-24 bg-gray-300 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-300 rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  if (!data || !config) {
    return (
      <div className="p-6 text-center text-gray-500">
        No scoring data available
      </div>
    )
  }

  const { scores, signals } = data
  const { overall } = scores

  return (
    <div className="flex flex-col gap-6">
      {/* Overall Score Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">综合评分</h3>
            <div className="flex items-baseline gap-2">
              <span
                className="text-5xl font-bold"
                style={{ color: overall.color }}
              >
                {overall.score}
              </span>
              <span className="text-2xl text-gray-500">/10</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-2">{overall.emoji}</div>
            <div
              className="text-lg font-semibold px-3 py-1 rounded-full"
              style={{
                backgroundColor: `${overall.color}20`,
                color: overall.color,
              }}
            >
              {overall.rating}
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-2">技术面</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-blue-600">
                {scores.technical}
              </span>
              <span className="text-xs text-gray-500">/100</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${scores.technical}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-2">基本面</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-green-600">
                {scores.fundamental}
              </span>
              <span className="text-xs text-gray-500">/100</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${scores.fundamental}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-2">情绪面</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-purple-600">
                {scores.sentiment}
              </span>
              <span className="text-xs text-gray-500">/100</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${scores.sentiment}%` }}
              />
            </div>
          </div>
        </div>

        {/* Risk Level */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">风险等级</p>
              <p
                className="text-lg font-semibold"
                style={{ color: overall.risk_color }}
              >
                {overall.risk_label}
              </p>
            </div>
            <p className="text-xs text-gray-600 max-w-xs text-right">
              {overall.risk_description}
            </p>
          </div>
        </div>

        {/* Trading Signals */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">交易信号</h4>
          <div className="space-y-2">
            {signals.signal_conditions && (
              <>
                {/* Generate signal descriptions from conditions */}
                {generateSignalDescriptions(signals.signal_conditions).length > 0 ? (
                  <>
                    {generateSignalDescriptions(signals.signal_conditions).map((signal, idx) => (
                      <div key={idx} className={`text-sm py-2 ${signal.color}`}>
                        {signal.emoji} {signal.text}
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-200">
                      <p className={`text-sm font-semibold ${getActionRecommendation(overall.score).color}`}>
                        {getActionRecommendation(overall.score).text}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 italic">暂无明显信号</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Weights Information */}
      {config && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">评分权重</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-2">技术面权重</p>
              <p className="text-2xl font-bold text-blue-600">
                {(overall.weights.technical * 100).toFixed(0)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-2">基本面权重</p>
              <p className="text-2xl font-bold text-green-600">
                {(overall.weights.fundamental * 100).toFixed(0)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-2">情绪面权重</p>
              <p className="text-2xl font-bold text-purple-600">
                {(overall.weights.sentiment * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Standards */}
      {config && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">评分标准</h4>

          {/* Rating Scale */}
          <div className="mb-6">
            <p className="text-xs text-gray-600 mb-3 font-medium">综合评级标准</p>
            <div className="space-y-2">
              {config.overall.score_to_rating.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-gray-700">{item.rating}</span>
                  </div>
                  <span className="text-gray-500">
                    {item.range[0]} - {item.range[1]} 分
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Levels */}
          <div>
            <p className="text-xs text-gray-600 mb-3 font-medium">风险等级定义</p>
            <div className="space-y-2">
              {Object.entries(config.overall.risk_levels).map(
                ([key, level]: any, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: level.color }}
                      />
                      <span className="font-medium text-gray-700">
                        {level.label}
                      </span>
                      <span className="text-gray-500">
                        ({level.range[0]} - {level.range[1]} 分)
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 ml-5">
                      {level.description}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScoringCard
