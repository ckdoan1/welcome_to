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

// BIS score values
const BIS_SCORES = [0, 1, 3, 6, 9, 12, 16, 20, 24, 28]

// Cannot make a move score values
const NO_MOVE_SCORES = [0, 0, 3, 6]

// Real Estate scores by lot size
const REAL_ESTATE_SCORES = {
  1: [1, 3],
  2: [2, 3, 4],
  3: [3, 4, 5, 6],
  4: [4, 5, 6, 7, 8],
  5: [5, 6, 7, 8, 10],
  6: [6, 7, 8, 10, 12],
}

function Score({ row1Parks = [], row2Parks = [], row3Parks = [], activePools = 0 }) {
  // Section 1 (Objectives): 3 inputs that sum to a total
  const [section1, setSection1] = useState(['', '', ''])
  const [section1Total, setSection1Total] = useState(0)

  // Section 4 (Construction/Temp Agency): track clicked buttons
  const [constructionClicked, setConstructionClicked] = useState(Array(9).fill(false))

  // Section 6 (BIS): track how many BIS used
  const [bisCount, setBisCount] = useState(0)

  // Section 7 (Cannot make a move): track penalty count
  const [noMoveCount, setNoMoveCount] = useState(0)

  // Section 5 (Real Estate): track selected score and count for each lot size
  const lotSizes = [1, 2, 3, 4, 5, 6]
  const [realEstateScores, setRealEstateScores] = useState({
    1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  })
  const [realEstateCounts, setRealEstateCounts] = useState({
    1: '', 2: '', 3: '', 4: '', 5: '', 6: ''
  })

  const toggleRealEstateScore = (lotSize, score) => {
    setRealEstateScores(prev => ({
      ...prev,
      [lotSize]: prev[lotSize].includes(score)
        ? prev[lotSize].filter(s => s !== score)
        : [...prev[lotSize], score]
    }))
  }

  const updateRealEstateCount = (lotSize, value) => {
    const numValue = value.replace(/[^0-9]/g, '')
    setRealEstateCounts(prev => ({
      ...prev,
      [lotSize]: numValue
    }))
  }

  // Calculate real estate subtotal - next unclicked score × count
  const getRealEstateSubtotal = (size) => {
    const clicked = realEstateScores[size] || []
    const count = parseInt(realEstateCounts[size]) || 0
    const allScores = REAL_ESTATE_SCORES[size]

    // Find the first unclicked score
    const nextScore = allScores.find(score => !clicked.includes(score))

    // If all are clicked, use the last score (final value)
    const scoreToUse = nextScore !== undefined ? nextScore : allScores[allScores.length - 1]

    return scoreToUse * count
  }

  const realEstateTotal = lotSizes.reduce((sum, size) => {
    return sum + getRealEstateSubtotal(size)
  }, 0)

  // Calculate BIS penalty
  const bisTotal = bisCount < BIS_SCORES.length ? BIS_SCORES[bisCount] : BIS_SCORES[BIS_SCORES.length - 1]

  // Calculate no-move penalty
  const noMoveTotal = noMoveCount < NO_MOVE_SCORES.length ? NO_MOVE_SCORES[noMoveCount] : NO_MOVE_SCORES[NO_MOVE_SCORES.length - 1]

  // Calculate pool score
  const poolTotal = activePools < POOL_SCORES.length ? POOL_SCORES[activePools] : POOL_SCORES[POOL_SCORES.length - 1]

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

  const toggleConstruction = (index) => {
    setConstructionClicked(prev => prev.map((v, i) => i === index ? !v : v))
  }

  const constructionCount = constructionClicked.filter(Boolean).length
  const constructionTotal = constructionCount >= 6 ? 7 : 0

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

  // Calculate final score
  const finalScore =
    section1Total +           // Objectives
    parksTotal +              // Parks
    poolTotal +               // Pools
    constructionTotal +       // Construction (Temp Agency)
    realEstateTotal -         // Real Estate
    bisTotal -                // BIS (subtracted)
    noMoveTotal               // Cannot move (subtracted)

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

      <div className="score-section">
        <div className="score-inputs construction">
          {constructionClicked.map((isClicked, index) => (
            <button
              key={index}
              className={`construction-btn ${isClicked ? 'active' : ''}`}
              onClick={() => toggleConstruction(index)}
            >
              <i className="fa-solid fa-road-barrier"></i>
            </button>
          ))}
        </div>
        <div className="score-total-wrapper construction">
          <div className="score-total">
            <span className="total-value">{constructionTotal}</span>
          </div>
        </div>
      </div>

      <div className="score-section real-estate-section">
        <div className="score-inputs real-estate">
          {lotSizes.map((size) => (
            <div key={size} className="real-estate-row">
              <div className="real-estate-top">
                <span className="lot-size-label">{size}</span>
                <div className="real-estate-scores">
                  {REAL_ESTATE_SCORES[size].map((score, index) => {
                    const isLast = index === REAL_ESTATE_SCORES[size].length - 1
                    const isActive = realEstateScores[size].includes(score)

                    if (isLast) {
                      return (
                        <span key={score} className="real-estate-final">
                          {score}
                        </span>
                      )
                    }

                    return (
                      <button
                        key={score}
                        className={`real-estate-btn ${isActive ? 'active' : ''}`}
                        onClick={() => toggleRealEstateScore(size, score)}
                      >
                        {score}
                      </button>
                    )
                  })}
                </div>
              </div>
              <input
                type="text"
                className="real-estate-count"
                value={realEstateCounts[size]}
                onChange={(e) => updateRealEstateCount(size, e.target.value)}
                placeholder="×"
              />
            </div>
          ))}
        </div>
        <div className="score-total-wrapper real-estate">
          {lotSizes.map((size) => (
            <div key={size} className="real-estate-subtotal">
              <span className="subtotal-value">{getRealEstateSubtotal(size)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="score-section">
        <div className="score-inputs bis">
          {BIS_SCORES.map((score, index) => (
            <button
              key={index}
              className={`bis-score-btn ${index < bisCount ? 'active' : ''}`}
              onClick={() => setBisCount(index < bisCount ? index : index + 1)}
            >
              {score}
            </button>
          ))}
        </div>
        <div className="score-total-wrapper bis">
          <div className="score-total negative">
            <span className="total-value">-{bisTotal}</span>
          </div>
        </div>
      </div>

      <div className="score-section">
        <div className="score-inputs no-move">
          {NO_MOVE_SCORES.map((score, index) => (
            <button
              key={index}
              className={`no-move-btn ${index < noMoveCount ? 'active' : ''}`}
              onClick={() => setNoMoveCount(index < noMoveCount ? index : index + 1)}
            >
              {score}
            </button>
          ))}
        </div>
        <div className="score-total-wrapper no-move">
          <div className="score-total negative">
            <span className="total-value">-{noMoveTotal}</span>
          </div>
        </div>
      </div>

      <div className="score-section final-score-section">
        <div className="final-score-label">Final Score</div>
        <div className="final-score-display">
          <span className="final-score-value">{finalScore}</span>
        </div>
      </div>
    </div>
  )
}

export default Score

