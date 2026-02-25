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
  onRightFenceClick
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
            />
          )}
        </div>

        <div className="house-lot-center">
          <input
            type="text"
            className="house-lot-number"
            value={number || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 1)
              onNumberChange?.(val)
            }}
            maxLength={1}
            inputMode="numeric"
            placeholder=""
          />
          <i className="fa-solid fa-house house-icon"></i>
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

