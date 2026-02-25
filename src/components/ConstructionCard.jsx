import './ConstructionCard.css'

function ConstructionCard({
  value,
  action,
  actionData,
  faceDown = false,
  showActionOnly = false,
  hideAction = false,
  onClick,
  numberSelected = false,
  actionSelected = false,
  onNumberClick,
  onActionClick
}) {
  const renderIcon = () => {
    if (!actionData?.icon) return null

    if (actionData.icon.startsWith('text:')) {
      const text = actionData.icon.replace('text:', '')
      return <span className="action-icon-text">{text}</span>
    }

    return <i className={actionData.icon}></i>
  }

  const handleNumberClick = (e) => {
    e.stopPropagation()
    onNumberClick?.()
  }

  const handleActionClick = (e) => {
    e.stopPropagation()
    onActionClick?.()
  }

  // Show only the action (for previous cards in multiplayer mode)
  if (showActionOnly) {
    return (
      <div
        className={`construction-card action-only action-${action}`}
        title={actionData?.description}
      >
        <div className={`card-action-only action-${action}`}>
          {renderIcon()}
        </div>
      </div>
    )
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
        <div className={`card-front ${hideAction ? 'number-only' : `action-${action}`}`}>
          <span
            className={`card-value ${numberSelected ? 'selected' : ''}`}
            onClick={handleNumberClick}
          >
            {value}
          </span>
          {actionData && !hideAction && (
            <div
              className={`card-action ${actionSelected ? 'selected' : ''}`}
              onClick={handleActionClick}
            >
              {renderIcon()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ConstructionCard

