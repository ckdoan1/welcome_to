import './ObjectiveCard.css'

function ObjectiveCard({ card, deckInfo }) {
  if (!card) return null

  // Sort requirements from largest to smallest
  const sortedRequirements = [...card.requirements].sort((a, b) => b - a)

  return (
    <div className="objective-card">
      <div className="objective-header">
        <span className="objective-deck">{deckInfo?.name}</span>
      </div>

      <div className="objective-requirements">
        {sortedRequirements.map((size, index) => (
          <div key={index} className="houses-group">
            {Array(size).fill(null).map((_, i) => (
              <i key={i} className="fa-solid fa-house house-icon"></i>
            ))}
          </div>
        ))}
      </div>

      <div className="objective-footer">
        <div className="objective-points-row">
          <span className="objective-points project">{card.projectPoints}</span>
          <span className="objective-points approved">{card.approvedPoints}</span>
        </div>
      </div>
    </div>
  )
}

export default ObjectiveCard

