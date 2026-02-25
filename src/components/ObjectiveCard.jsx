import './ObjectiveCard.css'

function ObjectiveCard({ card, deckInfo, isApproved = false, onClick, isClickable = false, isMet = false, onCheckClick }) {
  if (!card) return null

  // Sort requirements from largest to smallest
  const sortedRequirements = [...card.requirements].sort((a, b) => b - a)

  const handleCheckClick = (e) => {
    e.stopPropagation() // Prevent triggering the card click
    onCheckClick?.()
  }

  return (
    <div
      className={`objective-card ${isApproved ? 'approved-state' : ''} ${isClickable ? 'clickable' : ''}`}
      onClick={isClickable ? onClick : undefined}
    >
      <div className="objective-header">
        <span className="objective-deck">{deckInfo?.name}</span>
        <button
          className={`objective-check ${isMet ? 'met' : ''}`}
          onClick={handleCheckClick}
          aria-label="Mark objective as met"
        >
          <i className="fa-solid fa-check"></i>
        </button>
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
          <span className={`objective-points project ${isApproved ? 'inactive' : 'active'}`}>
            {card.projectPoints}
          </span>
          <span className={`objective-points approved ${isApproved ? 'active' : 'inactive'}`}>
            {card.approvedPoints}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ObjectiveCard

