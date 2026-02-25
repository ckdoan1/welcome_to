// Construction Cards Distribution
// Total: 81 cards

const CARD_DISTRIBUTION = {
  8: 9,   // Most common
  7: 8,
  9: 8,
  6: 7,
  10: 7,
  5: 6,
  11: 6,
  4: 5,
  12: 5,
  3: 4,
  13: 4,
  1: 3,   // Rarest
  2: 3,
  14: 3,
  15: 3,
}

// Action types and their distribution (total: 81)
const ACTIONS = {
  surveyor: {
    name: 'Surveyor',
    icon: 'fa-solid fa-xmarks-lines',
    description: 'Build a fence to divide streets into estates',
    count: 19,
  },
  landscaper: {
    name: 'Landscaper',
    icon: 'fa-solid fa-tree',
    description: 'Add a park to increase street value',
    count: 19,
  },
  realEstate: {
    name: 'Real Estate Agent',
    icon: 'fa-solid fa-coins',
    description: 'Increase point value of specific-sized estates',
    count: 12,
  },
  tempAgency: {
    name: 'Temp Agency',
    icon: 'fa-solid fa-road-barrier',
    description: 'Adjust house number by +/- 1 or 2',
    count: 12,
  },
  pool: {
    name: 'Pool Manufacturer',
    icon: 'fa-solid fa-person-swimming',
    description: 'Build a pool (only on houses with pool spots)',
    count: 9,
  },
  bis: {
    name: 'Bis',
    icon: 'text:BIS',
    description: 'Duplicate a number (costs points at end)',
    count: 10,
  },
  solo: {
    name: 'Solo',
    icon: 'fa-solid fa-house-circle-check',
    description: 'Solo card',
    count: 0, // Not part of regular action distribution
  },
}

// Generate array of actions based on distribution
function generateActions() {
  const actions = []
  Object.entries(ACTIONS).forEach(([key, action]) => {
    for (let i = 0; i < action.count; i++) {
      actions.push(key)
    }
  })
  return actions
}

// Shuffle array using Fisher-Yates algorithm
function shuffle(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Generate the deck of cards with randomly assigned actions
function generateDeck() {
  const deck = []
  const shuffledActions = shuffle(generateActions())
  let actionIndex = 0

  Object.entries(CARD_DISTRIBUTION).forEach(([value, count]) => {
    for (let i = 0; i < count; i++) {
      const actionKey = shuffledActions[actionIndex]
      deck.push({
        id: `card-${value}-${i}-${Date.now()}-${actionIndex}`,
        value: parseInt(value),
        action: actionKey,
        actionData: ACTIONS[actionKey],
      })
      actionIndex++
    }
  })

  // Add the Solo card
  deck.push({
    id: `card-solo-${Date.now()}`,
    value: 0,
    action: 'solo',
    actionData: ACTIONS.solo,
  })

  return deck
}

// Shuffle the deck using Fisher-Yates algorithm
function shuffleDeck(deck) {
  return shuffle(deck)
}

// Create a new shuffled deck with fresh random actions
function createShuffledDeck() {
  return shuffleDeck(generateDeck())
}

// Get card distribution info
function getDistribution() {
  return CARD_DISTRIBUTION
}

// Get total card count
function getTotalCards() {
  return Object.values(CARD_DISTRIBUTION).reduce((sum, count) => sum + count, 0)
}

export {
  CARD_DISTRIBUTION,
  ACTIONS,
  generateDeck,
  shuffleDeck,
  createShuffledDeck,
  getDistribution,
  getTotalCards,
}

