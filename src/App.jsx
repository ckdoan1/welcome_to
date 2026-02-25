import { useState } from 'react'
import './App.css'
import HouseLot from './components/HouseLot'
import ConstructionCard from './components/ConstructionCard'
import Parks from './components/Parks'
import { createShuffledDeck } from './data/constructionCards'

// Houses with pool option (0-indexed)
const ROW1_POOLS = [2, 6, 7] // 3rd, 7th, 8th
const ROW2_POOLS = [0, 3, 7] // 1st, 4th, 8th
const ROW3_POOLS = [1, 6, 10] // 2nd, 7th, 11th

function App() {
  // State for row 1 (10 houses)
  const [row1, setRow1] = useState(
    Array(10).fill(null).map(() => ({
      number: '',
      leftFenceActive: false,
      rightFenceActive: false,
      poolActive: false
    }))
  )

  // State for row 2 (11 houses)
  const [row2, setRow2] = useState(
    Array(11).fill(null).map(() => ({
      number: '',
      leftFenceActive: false,
      rightFenceActive: false,
      poolActive: false
    }))
  )

  // State for row 3 (12 houses)
  const [row3, setRow3] = useState(
    Array(12).fill(null).map(() => ({
      number: '',
      leftFenceActive: false,
      rightFenceActive: false,
      poolActive: false
    }))
  )

  // Parks state
  const [row1Parks, setRow1Parks] = useState([])
  const [row2Parks, setRow2Parks] = useState([])
  const [row3Parks, setRow3Parks] = useState([])

  const toggleRow1Park = (index) => {
    setRow1Parks(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const toggleRow2Park = (index) => {
    setRow2Parks(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const toggleRow3Park = (index) => {
    setRow3Parks(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  // Construction card deck
  const [deck, setDeck] = useState(() => createShuffledDeck())
  const [currentCards, setCurrentCards] = useState([])

  const drawThreeCards = () => {
    // Shuffle the deck and draw 3 cards
    const shuffled = [...deck].sort(() => Math.random() - 0.5)
    const drawn = shuffled.slice(0, 3)
    const remaining = shuffled.slice(3)

    setCurrentCards(drawn)
    setDeck(remaining)
  }

  const resetDeck = () => {
    setDeck(createShuffledDeck())
    setCurrentCards([])
  }

  const updateRow1House = (index, field, value) => {
    setRow1(prev => prev.map((house, i) =>
      i === index ? { ...house, [field]: value } : house
    ))
  }

  const updateRow2House = (index, field, value) => {
    setRow2(prev => prev.map((house, i) =>
      i === index ? { ...house, [field]: value } : house
    ))
  }

  const updateRow3House = (index, field, value) => {
    setRow3(prev => prev.map((house, i) =>
      i === index ? { ...house, [field]: value } : house
    ))
  }

  return (
    <div className="app">
      <div className="welcome-container">
        <div className="glow-orb"></div>
        <div className="glow-orb secondary"></div>

        <div className="top-bar">
          <h1 className="welcome-title">
            <span className="wave">👋</span> Welcome to
          </h1>

          <div className="card-section">
            <div className="deck-area">
              <p className="deck-count">Deck: {deck.length} cards</p>
              {deck.length >= 3 ? (
                <ConstructionCard faceDown onClick={drawThreeCards} />
              ) : (
                <p className="deck-empty">End of Game</p>
              )}
              <button className="reset-btn" onClick={resetDeck}>Reset Deck</button>
            </div>

            <div className="drawn-cards">
              <p className="drawn-label">Current Cards:</p>
              <div className="cards-display">
                {currentCards.length > 0 ? (
                  currentCards.map((card) => (
                    <ConstructionCard
                      key={card.id}
                      value={card.value}
                      action={card.action}
                      actionData={card.actionData}
                    />
                  ))
                ) : (
                  <>
                    <div className="card-placeholder"></div>
                    <div className="card-placeholder"></div>
                    <div className="card-placeholder"></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="street-row">
          <Parks
            values={[0, 2, 4]}
            finalValue={10}
            activeParks={row1Parks}
            onParkClick={toggleRow1Park}
          />
          <div className="house-row">
            {row1.map((house, index) => (
              <HouseLot
                key={index}
                number={house.number}
                onNumberChange={(val) => updateRow1House(index, 'number', val)}
                topButton={ROW1_POOLS.includes(index) ? true : null}
                onTopButtonClick={() => updateRow1House(index, 'poolActive', !house.poolActive)}
                poolActive={house.poolActive}
                showLeftFence={index === 0}
                leftFenceActive={house.leftFenceActive}
                onLeftFenceClick={() => updateRow1House(index, 'leftFenceActive', !house.leftFenceActive)}
                rightFenceActive={house.rightFenceActive}
                onRightFenceClick={() => updateRow1House(index, 'rightFenceActive', !house.rightFenceActive)}
              />
            ))}
          </div>
        </div>

        <div className="street-row">
          <Parks
            values={[0, 2, 4, 6]}
            finalValue={14}
            activeParks={row2Parks}
            onParkClick={toggleRow2Park}
          />
          <div className="house-row">
            {row2.map((house, index) => (
              <HouseLot
                key={index}
                number={house.number}
                onNumberChange={(val) => updateRow2House(index, 'number', val)}
                topButton={ROW2_POOLS.includes(index) ? true : null}
                onTopButtonClick={() => updateRow2House(index, 'poolActive', !house.poolActive)}
                poolActive={house.poolActive}
                showLeftFence={index === 0}
                leftFenceActive={house.leftFenceActive}
                onLeftFenceClick={() => updateRow2House(index, 'leftFenceActive', !house.leftFenceActive)}
                rightFenceActive={house.rightFenceActive}
                onRightFenceClick={() => updateRow2House(index, 'rightFenceActive', !house.rightFenceActive)}
              />
            ))}
          </div>
        </div>

        <div className="street-row">
          <Parks
            values={[0, 2, 4, 6, 8]}
            finalValue={18}
            activeParks={row3Parks}
            onParkClick={toggleRow3Park}
          />
          <div className="house-row">
            {row3.map((house, index) => (
              <HouseLot
                key={index}
                number={house.number}
                onNumberChange={(val) => updateRow3House(index, 'number', val)}
                topButton={ROW3_POOLS.includes(index) ? true : null}
                onTopButtonClick={() => updateRow3House(index, 'poolActive', !house.poolActive)}
                poolActive={house.poolActive}
                showLeftFence={index === 0}
                leftFenceActive={house.leftFenceActive}
                onLeftFenceClick={() => updateRow3House(index, 'leftFenceActive', !house.leftFenceActive)}
                rightFenceActive={house.rightFenceActive}
                onRightFenceClick={() => updateRow3House(index, 'rightFenceActive', !house.rightFenceActive)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

