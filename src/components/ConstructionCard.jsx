import './ConstructionCard.css'

function ConstructionCard({ value, action, actionData, faceDown = false, onClick }) {
  const renderIcon = () => {
    if (!actionData?.icon) return null

    if (actionData.icon.startsWith('text:')) {
      const text = actionData.icon.replace('text:', '')
      return <span className="action-icon-text">{text}</span>
    }

    return <i className={actionData.icon}></i>
  }

  return (
    <div
      className={`construction-card ${faceDown ? 'face-down' : ''}`}
      onClick={onClick}
      title={actionData?.description}
    >
      {faceDown ? (
        <div className="card-back">
          <i className="fa-solid fa-hammer"></i>
          <span className="next-round-text">Next Round</span>
        </div>
      ) : (
        <div className={`card-front action-${action}`}>
          <span className="card-value">{value}</span>
          {actionData && (
            <div className="card-action">
              {renderIcon()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ConstructionCard

