import { useState, useEffect } from 'react'
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

// Seeded random number generator (mulberry32)
function createSeededRandom(seed) {
  let state = seed
  return function() {
    state |= 0
    state = state + 0x6D2B79F5 | 0
    let t = Math.imul(state ^ state >>> 15, 1 | state)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// Seeded shuffle using Fisher-Yates
function seededShuffle(array, rng) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Generate a random seed
function generateSeed() {
  return Math.floor(Math.random() * 1000000)
}

function App() {
  // Game mode: 'solo' or 'multiplayer'
  const [gameMode, setGameMode] = useState('solo')

  // Seed for deterministic randomness
  const [gameSeed, setGameSeed] = useState(() => generateSeed())
  const [seedInput, setSeedInput] = useState('')
  const [drawCount, setDrawCount] = useState(0) // Track draws for consistent seeding

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
  const [deck, setDeck] = useState(() => {
    // Solo mode uses random, multiplayer uses seeded
    if (gameMode === 'solo') {
      return createShuffledDeck(true)
    }
    const deckRng = createSeededRandom(gameSeed)
    return createShuffledDeck(false, deckRng)
  })
  const [currentCards, setCurrentCards] = useState([])
  const [previousCards, setPreviousCards] = useState([]) // For multiplayer mode
  const [soloActivated, setSoloActivated] = useState(false)
  const [cardSelections, setCardSelections] = useState({})
  const [roundNumber, setRoundNumber] = useState(0)

  // Recreate deck when game mode or seed changes
  useEffect(() => {
    const includeSoloCard = gameMode === 'solo'
    // Solo mode uses random, multiplayer uses seeded RNG
    if (gameMode === 'solo') {
      setDeck(createShuffledDeck(includeSoloCard))
    } else {
      const deckRng = createSeededRandom(gameSeed)
      setDeck(createShuffledDeck(includeSoloCard, deckRng))
    }
    setCurrentCards([])
    setPreviousCards([])
    setSoloActivated(false)
    setCardSelections({})
    setRoundNumber(0)
    setDrawCount(0)
    setApprovedObjectives({ n1: false, n2: false, n3: false })
    setMetObjectives({ n1: false, n2: false, n3: false })
  }, [gameMode, gameSeed])

  const drawThreeCards = () => {
    let currentDeck = deck
    const newDrawCount = drawCount + 1

    // In multiplayer mode, reshuffle if deck is running low
    if (gameMode === 'multiplayer' && currentDeck.length < 3) {
      // Use seeded RNG for deck recreation
      const deckRng = createSeededRandom(gameSeed + newDrawCount * 10000)
      currentDeck = createShuffledDeck(false, deckRng)
    }

    let shuffled
    if (gameMode === 'solo') {
      // Solo mode uses random shuffle
      shuffled = [...currentDeck].sort(() => Math.random() - 0.5)
    } else {
      // Multiplayer uses seeded shuffle for consistency
      const rng = createSeededRandom(gameSeed + newDrawCount * 1000)
      shuffled = seededShuffle(currentDeck, rng)
    }

    const drawn = shuffled.slice(0, 3)
    const remaining = shuffled.slice(3)

    // Check if solo card was drawn
    if (drawn.some(card => card.action === 'solo')) {
      setSoloActivated(true)
    }

    // Save current cards as previous (for multiplayer mode)
    setPreviousCards(currentCards)
    setCurrentCards(drawn)
    setDeck(remaining)
    setCardSelections({}) // Reset selections when new cards are drawn
    setRoundNumber(prev => prev + 1) // Increment round
    setDrawCount(newDrawCount)
  }

  const handleSeedSubmit = () => {
    const newSeed = parseInt(seedInput)
    if (!isNaN(newSeed) && newSeed > 0) {
      setGameSeed(newSeed)
      setSeedInput('')
    }
  }

  const handleGenerateNewSeed = () => {
    setGameSeed(generateSeed())
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
  const [approvedObjectives, setApprovedObjectives] = useState({ n1: false, n2: false, n3: false })
  const [metObjectives, setMetObjectives] = useState({ n1: false, n2: false, n3: false })

  const pickNewObjectives = () => {
    setObjectives(getRandomObjectives())
    setApprovedObjectives({ n1: false, n2: false, n3: false })
    setMetObjectives({ n1: false, n2: false, n3: false })
  }

  const toggleObjectiveApproved = (deck) => {
    setApprovedObjectives(prev => ({
      ...prev,
      [deck]: !prev[deck]
    }))
  }

  const toggleObjectiveMet = (deck) => {
    setMetObjectives(prev => ({
      ...prev,
      [deck]: !prev[deck]
    }))
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
            {gameMode === 'multiplayer' && (
              <div className="seed-display">
                <span className="seed-label">Seed:</span>
                <span className="seed-value">{gameSeed}</span>
              </div>
            )}
          </div>
          {gameMode === 'multiplayer' && (
            <div className="seed-controls">
              <input
                type="text"
                className="seed-input"
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter seed"
                onKeyDown={(e) => e.key === 'Enter' && handleSeedSubmit()}
              />
              <button className="seed-btn" onClick={handleSeedSubmit}>
                <i className="fa-solid fa-check"></i>
              </button>
              <button className="seed-btn generate" onClick={handleGenerateNewSeed}>
                <i className="fa-solid fa-dice"></i>
              </button>
            </div>
          )}
          <div className="game-mode-toggle">
            <button
              className={`mode-btn ${gameMode === 'solo' ? 'active' : ''}`}
              onClick={() => setGameMode('solo')}
            >
              <i className="fa-solid fa-user"></i>
              Solo
            </button>
            <button
              className={`mode-btn ${gameMode === 'multiplayer' ? 'active' : ''}`}
              onClick={() => setGameMode('multiplayer')}
            >
              <i className="fa-solid fa-users"></i>
              Multiplayer
            </button>
          </div>
        </div>

        <div className="cards-row">
          <div className="card-section">
            <div className="deck-area">
              <div className="round-pill">
                <span className="round-number">Round {roundNumber}</span>
              </div>
              <div className="deck-stack">
                <p className="deck-count">Deck: {deck.length} cards</p>
                {deck.length >= 3 || gameMode === 'multiplayer' ? (
                  <ConstructionCard faceDown onClick={drawThreeCards} />
                ) : (
                  <p className="deck-empty">End of Game</p>
                )}
              </div>
            </div>

            <div className="drawn-cards">
              <p className="drawn-label">Current Cards:</p>
              {gameMode === 'solo' ? (
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
              ) : (
                <div className="cards-display multiplayer">
                  {currentCards.length > 0 ? (
                    currentCards.map((card, index) => (
                      <div key={card.id} className="card-stack">
                        <ConstructionCard
                          value={card.value}
                          action={card.action}
                          actionData={card.actionData}
                          hideAction
                          numberSelected={cardSelections[card.id]?.numberSelected}
                          onNumberClick={() => toggleCardNumber(card.id)}
                        />
                        {previousCards[index] && (
                          <ConstructionCard
                            value={previousCards[index].value}
                            action={previousCards[index].action}
                            actionData={previousCards[index].actionData}
                            showActionOnly
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="card-placeholder"></div>
                      <div className="card-placeholder"></div>
                      <div className="card-placeholder"></div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="objectives-section">
            <div className="objectives-header">
              <p className="objectives-label">Objective Cards:</p>
              <button className="new-objectives-btn" onClick={pickNewObjectives}>
                New Objectives
              </button>
            </div>
            <div className="objectives-display">
              <ObjectiveCard
                card={objectives.n1}
                deckInfo={getDeckInfo('n1')}
                isApproved={approvedObjectives.n1 || (gameMode === 'solo' && soloActivated)}
                isClickable={gameMode === 'multiplayer'}
                onClick={() => toggleObjectiveApproved('n1')}
                isMet={metObjectives.n1}
                onCheckClick={() => toggleObjectiveMet('n1')}
              />
              <ObjectiveCard
                card={objectives.n2}
                deckInfo={getDeckInfo('n2')}
                isApproved={approvedObjectives.n2 || (gameMode === 'solo' && soloActivated)}
                isClickable={gameMode === 'multiplayer'}
                onClick={() => toggleObjectiveApproved('n2')}
                isMet={metObjectives.n2}
                onCheckClick={() => toggleObjectiveMet('n2')}
              />
              <ObjectiveCard
                card={objectives.n3}
                deckInfo={getDeckInfo('n3')}
                isApproved={approvedObjectives.n3 || (gameMode === 'solo' && soloActivated)}
                isClickable={gameMode === 'multiplayer'}
                onClick={() => toggleObjectiveApproved('n3')}
                isMet={metObjectives.n3}
                onCheckClick={() => toggleObjectiveMet('n3')}
              />
            </div>
            {soloActivated && (
              <div className="solo-activated">
                <i className="fa-solid fa-house-circle-check"></i>
                <span>Solo Card Activated!</span>
              </div>
            )}
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

