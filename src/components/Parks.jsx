import './Parks.css'

function Parks({ values, finalValue, activeParks = [], onParkClick }) {
  return (
    <div className="parks">
      <div className="parks-buttons">
        {values.map((value, index) => (
          <button
            key={index}
            className={`park-button ${activeParks.includes(index) ? 'active' : ''}`}
            onClick={() => onParkClick?.(index)}
          >
            {value}
          </button>
        ))}
        <div className="parks-final">
          {finalValue}
        </div>
      </div>
    </div>
  )
}

export default Parks

