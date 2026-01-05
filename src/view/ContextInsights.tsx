import { ContextAnalysis } from '@ai/ContextAnalyzer'
import './ContextInsights.css'

interface ContextInsightsProps {
  analysis: ContextAnalysis | null
}

export function ContextInsights({ analysis }: ContextInsightsProps) {
  if (!analysis) {
    return (
      <div className="context-insights">
        <div className="context-insights__header">
          <h3>Context Analysis</h3>
        </div>
        <div className="context-insights__empty">
          <p>No analysis available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="context-insights">
      <div className="context-insights__header">
        <h3>Context Analysis</h3>
      </div>

      <div className="context-insights__section">
        <div className="context-insights__section-title">
          Recommended View
        </div>
        <div className="context-insights__recommendation">
          <div className="context-insights__view-badge">
            {analysis.recommendedView.orientation}
          </div>
          <div className="context-insights__reason">
            {analysis.recommendedView.reason}
          </div>
          <div className="context-insights__confidence">
            Confidence: <span className={`confidence--${analysis.recommendedView.confidence}`}>
              {analysis.recommendedView.confidence}
            </span>
          </div>
        </div>
      </div>

      {analysis.suggestedFocus.length > 0 && (
        <div className="context-insights__section">
          <div className="context-insights__section-title">Suggested Focus</div>
          <ul className="context-insights__focus-list">
            {analysis.suggestedFocus.map((focus, index) => (
              <li key={index} className="context-insights__focus-item">
                {focus}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.metadataInsights.length > 0 && (
        <div className="context-insights__section">
          <div className="context-insights__section-title">Metadata Insights</div>
          <ul className="context-insights__metadata-list">
            {analysis.metadataInsights.map((insight, index) => (
              <li key={index} className="context-insights__metadata-item">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
