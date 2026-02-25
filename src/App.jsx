import { useState } from 'react'
import './App.css'
import HouseLot from './components/HouseLot'
import ConstructionCard from './components/ConstructionCard'
import ObjectiveCard from './components/ObjectiveCard'
import Parks from './components/Parks'
import Score from './components/Score'
import { createShuffledDeck } from './data/constructionCards'
import { getRandomObjectives, getDeckInfo } from './data/objectiveCards'

// Houses with pool option (0-indexed)
const ROW1_POOLS = [2, 6, 7] // 3rd, 7th, 8th
const ROW2_POOLS = [0, 3, 7] // 1st, 4th, 8th
const ROW3_POOLS = [1, 6, 10] // 2nd, 7th, 11th

function App() {
  // State for row 1 (10 houses)
  const [row1, setRow1] = useState(
    Array(10).fill(null).map((_, index) => ({
      number: '',
      leftFenceActive: index === 0, // First fence always active
      rightFenceActive: index === 9, // Last fence always active
      poolActive: false,
      houseActive: false
    }))
  )

  // State for row 2 (11 houses)
  const [row2, setRow2] = useState(
    Array(11).fill(null).map((_, index) => ({
      number: '',
      leftFenceActive: index === 0, // First fence always active
      rightFenceActive: index === 10, // Last fence always active
      poolActive: false,
      houseActive: false
    }))
  )

  // State for row 3 (12 houses)
  const [row3, setRow3] = useState(
    Array(12).fill(null).map((_, index) => ({
      number: '',
      leftFenceActive: index === 0, // First fence always active
      rightFenceActive: index === 11, // Last fence always active
      poolActive: false,
      houseActive: false
    }))
  )

  // Neighbourhood name
  const [neighbourhoodName, setNeighbourhoodName] = useState('')

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
  const [soloActivated, setSoloActivated] = useState(false)
  const [cardSelections, setCardSelections] = useState({})

  const drawThreeCards = () => {
    // Shuffle the deck and draw 3 cards
    const shuffled = [...deck].sort(() => Math.random() - 0.5)
    const drawn = shuffled.slice(0, 3)
    const remaining = shuffled.slice(3)

    // Check if solo card was drawn
    if (drawn.some(card => card.action === 'solo')) {
      setSoloActivated(true)
    }

    setCurrentCards(drawn)
    setDeck(remaining)
    setCardSelections({}) // Reset selections when new cards are drawn
  }

  const toggleCardNumber = (cardId) => {
    setCardSelections(prev => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        numberSelected: !prev[cardId]?.numberSelected
      }
    }))
  }

  const toggleCardAction = (cardId) => {
    setCardSelections(prev => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        actionSelected: !prev[cardId]?.actionSelected
      }
    }))
  }

  // Objective cards
  const [objectives, setObjectives] = useState(() => getRandomObjectives())

  const pickNewObjectives = () => {
    setObjectives(getRandomObjectives())
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

        <div className="header-row">
          <div className="title-section">
            <h1 className="welcome-title">
              <span className="wave"></span> Welcome to
            </h1>
            <input
              type="text"
              className="neighbourhood-input"
              value={neighbourhoodName}
              onChange={(e) => setNeighbourhoodName(e.target.value)}
              placeholder=" "
            />
          </div>
        </div>

        <div className="cards-row">
          <div className="card-section">
            <div className="deck-area">
              <p className="deck-count">Deck: {deck.length} cards</p>
              {deck.length >= 3 ? (
                <ConstructionCard faceDown onClick={drawThreeCards} />
              ) : (
                <p className="deck-empty">End of Game</p>
              )}
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
                      numberSelected={cardSelections[card.id]?.numberSelected}
                      actionSelected={cardSelections[card.id]?.actionSelected}
                      onNumberClick={() => toggleCardNumber(card.id)}
                      onActionClick={() => toggleCardAction(card.id)}
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

          {soloActivated && (
            <div className="solo-activated">
              <i className="fa-solid fa-house-circle-check"></i>
              <span>Solo Card Activated!</span>
            </div>
          )}

          <div className="objectives-section">
            <div className="objectives-header">
              <p className="objectives-label">Objective Cards:</p>
              <button className="new-objectives-btn" onClick={pickNewObjectives}>
                New Objectives
              </button>
            </div>
            <div className="objectives-display">
              <ObjectiveCard card={objectives.n1} deckInfo={getDeckInfo('n1')} />
              <ObjectiveCard card={objectives.n2} deckInfo={getDeckInfo('n2')} />
              <ObjectiveCard card={objectives.n3} deckInfo={getDeckInfo('n3')} />
            </div>
          </div>
        </div>

        <div className="street-row">
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
                houseActive={house.houseActive}
                onHouseClick={() => updateRow1House(index, 'houseActive', !house.houseActive)}
              />
            ))}
          </div>
          <Parks
            values={[0, 2, 4]}
            finalValue={10}
            activeParks={row1Parks}
            onParkClick={toggleRow1Park}
          />
        </div>

        <div className="street-row">
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
                houseActive={house.houseActive}
                onHouseClick={() => updateRow2House(index, 'houseActive', !house.houseActive)}
              />
            ))}
          </div>
          <Parks
            values={[0, 2, 4, 6]}
            finalValue={14}
            activeParks={row2Parks}
            onParkClick={toggleRow2Park}
          />
        </div>

        <div className="street-row">
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
                houseActive={house.houseActive}
                onHouseClick={() => updateRow3House(index, 'houseActive', !house.houseActive)}
              />
            ))}
          </div>
          <Parks
            values={[0, 2, 4, 6, 8]}
            finalValue={18}
            activeParks={row3Parks}
            onParkClick={toggleRow3Park}
          />
        </div>

        <Score
          row1Parks={row1Parks}
          row2Parks={row2Parks}
          row3Parks={row3Parks}
          activePools={
            row1.filter(h => h.poolActive).length +
            row2.filter(h => h.poolActive).length +
            row3.filter(h => h.poolActive).length
          }
        />
      </div>
    </div>
  )
}

export default App

