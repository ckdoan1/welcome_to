import { useState, useEffect } from 'react'
import './Score.css'

// Park values and finals for each row
const PARK_CONFIG = [
  { values: [0, 2, 4], final: 10 },
  { values: [0, 2, 4, 6], final: 14 },
  { values: [0, 2, 4, 6, 8], final: 18 },
]

// Pool score values
const POOL_SCORES = [0, 3, 6, 9, 13, 17, 21, 26, 31, 36]

function Score({ row1Parks = [], row2Parks = [], row3Parks = [], activePools = 0 }) {
  // Section 1 (Objectives): 3 inputs that sum to a total
  const [section1, setSection1] = useState(['', '', ''])
  const [section1Total, setSection1Total] = useState(0)

  // Calculate objective totals when inputs change
  useEffect(() => {
    const total = section1.reduce((sum, val) => {
      const num = parseInt(val) || 0
      return sum + num
    }, 0)
    setSection1Total(total)
  }, [section1])

  const updateSection1 = (index, value) => {
    // Only allow numbers
    const numValue = value.replace(/[^0-9-]/g, '')
    setSection1(prev => prev.map((v, i) => i === index ? numValue : v))
  }

  // Calculate park score based on clicked parks
  const calculateParkScore = (activeParks, config) => {
    const clickedCount = activeParks.length
    if (clickedCount === 0) return 0
    if (clickedCount >= config.values.length) return config.final
    return config.values[clickedCount]
  }

  const parkScores = [
    calculateParkScore(row1Parks, PARK_CONFIG[0]),
    calculateParkScore(row2Parks, PARK_CONFIG[1]),
    calculateParkScore(row3Parks, PARK_CONFIG[2]),
  ]

  const parksTotal = parkScores.reduce((sum, score) => sum + score, 0)

  return (
    <div className="score-container">
      <div className="score-section">
        <div className="score-inputs">
          {section1.map((value, index) => (
            <div key={index} className="score-input-row">
              <span className="score-label">n{index + 1}</span>
              <input
                type="text"
                className="score-input"
                value={value}
                onChange={(e) => updateSection1(index, e.target.value)}
                placeholder=""
              />
            </div>
          ))}
        </div>
        <div className="score-total-wrapper">
          <div className="score-total">
            <span className="total-value">{section1Total}</span>
          </div>
        </div>
      </div>

      <div className="score-section">
        <div className="score-inputs parks">
          {parkScores.map((score, index) => (
            <div key={index} className="score-display">
              <span className="score-value">{score}</span>
            </div>
          ))}
        </div>
        <div className="score-total-wrapper parks">
          <div className="score-total">
            <span className="total-value">{parksTotal}</span>
          </div>
        </div>
      </div>

      <div className="score-section">
        <div className="score-inputs pools">
          {POOL_SCORES.map((score, index) => (
            <div
              key={index}
              className={`pool-score-display ${index < activePools ? 'active' : ''}`}
            >
              {score}
            </div>
          ))}
        </div>
        <div className="score-total-wrapper pools">
          <div className="score-total">
            <span className="total-value">{activePools < POOL_SCORES.length ? POOL_SCORES[activePools] : POOL_SCORES[POOL_SCORES.length - 1]}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Score

