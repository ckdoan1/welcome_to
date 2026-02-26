import { useState, useEffect } from 'react'
import './App.css'
import HouseLot from './components/HouseLot'
import ConstructionCard from './components/ConstructionCard'
import ObjectiveCard from './components/ObjectiveCard'
import Parks from './components/Parks'
import Score from './components/Score'
import { createShuffledDeck } from './data/constructionCards'
import { getRandomObjectives, getSeededObjectives, getDeckInfo } from './data/objectiveCards'

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
      // In multiplayer mode, use seeded objectives
      setObjectives(getSeededObjectives(gameSeed))
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

  // Instructions modal
  const [showInstructions, setShowInstructions] = useState(false)
  const [instructionsTab, setInstructionsTab] = useState('overview')

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
            <button
                className="instructions-btn"
                onClick={() => setShowInstructions(true)}
                aria-label="Game Instructions"
              >
                <i className="fa-solid fa-circle-info"></i>
              </button>
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
              <p className="objectives-label">City Plans:</p>
              {gameMode === 'solo' && (
                <button className="new-objectives-btn" onClick={pickNewObjectives}>
                  New Objectives
                </button>
              )}
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
          gameMode={gameMode}
        />
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="instructions-overlay" onClick={() => setShowInstructions(false)}>
          <div className="instructions-modal" onClick={(e) => e.stopPropagation()}>
            <button className="instructions-close" onClick={() => setShowInstructions(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <h2 className="instructions-title">How to Play Welcome To...</h2>

            <div className="instructions-content">
              {/* TABS */}
              <div className="instructions-tabs">
                <button
                  className={`instructions-tab ${instructionsTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setInstructionsTab('overview')}
                >
                  <i className="fa-solid fa-house"></i> Overview
                </button>
                <button
                  className={`instructions-tab ${instructionsTab === 'actions' ? 'active' : ''}`}
                  onClick={() => setInstructionsTab('actions')}
                >
                  <i className="fa-solid fa-wand-magic-sparkles"></i> Actions
                </button>
                <button
                  className={`instructions-tab ${instructionsTab === 'endgame' ? 'active' : ''}`}
                  onClick={() => setInstructionsTab('endgame')}
                >
                  <i className="fa-solid fa-flag-checkered"></i> End Game
                </button>
              </div>

              {/* TAB CONTENT */}
              <div className="instructions-tab-content">
                {instructionsTab === 'overview' && (
                  <div className="instructions-group">
                    <section className="instruction-section">
                      <h3><i className="fa-solid fa-house icon-house"></i> How to Play</h3>
                      <p>A game is played for several successive rounds. In each round, perform the following 5 steps in order:</p>
                      <ol className="steps-list">
                        <li>Flip 3 Construction cards</li>
                        <li>Select a Number-Action combination</li>
                        <li>Number a house <span className="step-tag mandatory">mandatory</span></li>
                        <li>Use the Action <span className="step-tag optional">optional</span></li>
                        <li>Validate a City Plan <span className="step-tag optional">optional</span></li>
                      </ol>
                      <p className="step-note">Numbers must always increase from left to right within each street.</p>
                    </section>

                    <section className="instruction-section">
                      <h3><i className="fa-solid fa-ban icon-refusal"></i> Permit Refusal</h3>
                      <p>If you cannot (or choose not to) write a number, you must take a Permit Refusal. Cross out one refusal box - these cost penalty points at game end.</p>
                    </section>

                    <section className="instruction-section solo-section">
                      <h3><i className="fa-solid fa-user icon-solo"></i> Solo Mode</h3>
                      <p>Solo mode has a slight variation: instead of working with three pairs of cards, you draw three cards. Take one card for its <strong>number</strong>, one card for its <strong>action</strong>, and discard the third.</p>
                      <p className="solo-card-note"><i className="fa-solid fa-star"></i> A special <strong>Solo Card</strong> is shuffled into the deck. When drawn, all City Plan bonuses switch from "Project" points to the lower "Approved" points for the rest of the game.</p>
                    </section>

                    <a
                      href="https://bluecocker.com/wp-content/uploads/2023/08/Rulebook-EN.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="official-rules-link"
                    >
                      <i className="fa-solid fa-file-pdf"></i>
                      View Official Rulebook (PDF)
                    </a>
                  </div>
                )}

                {instructionsTab === 'actions' && (
                  <div className="instructions-group">
                    <section className="instruction-section">
                      <h3><i className="fa-solid fa-xmarks-lines icon-surveyor"></i> Fence</h3>
                      <p>Draw a fence between any two houses (numbered or not) in any street. Fences define housing estates - groups of neighboring houses between two fences. You can divide existing estates with new fences, unless already used to validate a City Plan.</p>
                    </section>

                    <section className="instruction-section">
                      <h3><i className="fa-solid fa-coins icon-realestate"></i> Improvement</h3>
                      <p>Increase the value of completed housing estates of a specific size (1-6 houses). Cross out one box in the chosen column, in ascending order. At game end, each complete estate of that size earns points equal to the lowest visible value in that column.</p>
                    </section>

                    <section className="instruction-section">
                      <h3><i className="fa-solid fa-tree icon-landscaper"></i> Park</h3>
                      <p>Cross out one park box in the same street where you wrote your number.</p>
                    </section>

                    <section className="instruction-section">
                      <h3><i className="fa-solid fa-person-swimming icon-pool"></i> Pool</h3>
                      <p>If you number a house with a pool symbol while using this action, circle the pool and cross out one pool box. You can number a pool house without this action, but you won't be able to build that pool later.</p>
                    </section>

                    <section className="instruction-section">
                      <h3><i className="fa-solid fa-road-barrier icon-temp"></i> Temp Worker</h3>
                      <p>Before writing your number, you may add or subtract 0, 1, or 2 from it (e.g., an 8 can become 6, 7, 8, 9, or 10). You can get 16-17 from 14-15, or 0 from 1-2 (but never below 0). Cross out one temp worker box regardless of whether you modified the number.</p>
                    </section>

                    <section className="instruction-section">
                      <h3><span className="bis-text">BIS</span> Extension</h3>
                      <p>Create a duplicate "Bis number" - copy any already-numbered house (including one just placed) to an empty house directly adjacent to it. Mark the copy with "B". Cross out one extension box in ascending order. You can create series like 4-5B-5-5B. Two identical Bis numbers can be separated by a fence. Costs penalty points at game end.</p>
                    </section>
                  </div>
                )}

                {instructionsTab === 'endgame' && (
                  <div className="instructions-group">
                    <section className="instruction-section">
                      <h3><i className="fa-solid fa-trophy icon-objectives"></i> City Plans</h3>
                      <p>The 3 Plan cards (N1, N2, N3) are city objectives requiring specific estate combinations. When you meet the conditions, validate it to score points. First to validate scores "Project" points; later players score "Approved" points. Once an estate validates a plan, draw a line over it - it cannot validate another plan or be divided by fences. You can validate multiple plans per round. If two players achieve the plan in the same round they both get the points.</p>
                    </section>

                    <section className="instruction-section">
                      <h3><i className="fa-solid fa-flag-checkered icon-gameend"></i> Game End</h3>
                      <p>The game ends after the current round when: (1) a player validates all 3 City Plans, (2) a player takes their third Permit Refusal, or (3) a player numbers all houses in all three streets.</p>
                    </section>

                    <section className="instruction-section scoring-section">
                      <h3><i className="fa-solid fa-calculator icon-scoring"></i> Scoring</h3>
                      <ul className="scoring-list">
                        <li><i className="fa-solid fa-trophy icon-objectives"></i><span><strong>City Plans:</strong> Add up points from validated plans.</span></li>
                        <li><i className="fa-solid fa-tree icon-landscaper"></i><span><strong>Parks:</strong> Take the lowest visible value of each street and add them.</span></li>
                        <li><i className="fa-solid fa-person-swimming icon-pool"></i><span><strong>Pools:</strong> Write the lowest visible value in the pool section.</span></li>
                        <li><i className="fa-solid fa-road-barrier icon-temp"></i><span><strong>Temp Workers:</strong> Most crossed boxes = 7 pts, 2nd = 4 pts, 3rd = 1 pt. No boxes crossed = 0 pts.</span></li>
                        <li><i className="fa-solid fa-coins icon-realestate"></i><span><strong>Housing Estates:</strong> For each size (1-6), count complete estates × lowest visible value for that size.</span></li>
                        <li><span className="bis-text-small">BIS</span><span><strong>Extensions:</strong> Subtract the lowest visible value (penalty).</span></li>
                        <li><i className="fa-solid fa-ban icon-refusal"></i><span><strong>Permit Refusals:</strong> Subtract the lowest visible value (penalty).</span></li>
                      </ul>
                      <p className="scoring-note">Highest score wins! Ties broken by most complete estates.</p>
                    </section>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

