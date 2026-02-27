import './HouseLot.css'

function HouseLot({
  number,
  onNumberChange,
  topButton,
  onTopButtonClick,
  poolActive,
  showLeftFence = false,
  leftFenceActive,
  onLeftFenceClick,
  rightFenceActive,
  onRightFenceClick,
  houseColor,
  onHouseClick
}) {
  return (
    <div className="house-lot">
      {showLeftFence && (
        <button
          className={`fence ${leftFenceActive ? 'active' : ''}`}
          onClick={onLeftFenceClick}
          aria-label="Left fence"
        />
      )}

      <div className="house-lot-content">
        <div className="house-lot-top">
          {topButton && (
            <button
              className={`pool-button ${poolActive ? 'active' : ''}`}
              onClick={onTopButtonClick}
              aria-label="Pool"
            >
              <i className="fa-solid fa-person-swimming"></i>
            </button>
          )}
        </div>

        <div className="house-lot-center">
          <input
            type="text"
            className="house-lot-number"
            value={number || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2)
              onNumberChange?.(val)
            }}
            maxLength={2}
            inputMode="numeric"
            placeholder=""
          />
          <button
            className={`house-icon-btn ${houseColor ? `color-${houseColor}` : ''}`}
            onClick={onHouseClick}
            aria-label="House"
          >
            <i className="fa-solid fa-house"></i>
          </button>
        </div>
      </div>

      <button
        className={`fence ${rightFenceActive ? 'active' : ''}`}
        onClick={onRightFenceClick}
        aria-label="Right fence"
      />
    </div>
  )
}

export default HouseLot

