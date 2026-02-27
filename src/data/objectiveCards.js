// Objective Cards Data
// Three decks of increasing difficulty

const OBJECTIVE_DECKS = {
  n1: {
    name: 'N°1',
    difficulty: 'Easiest',
    pointRange: '6-8 points',
    cards: [
      {
        id: 'n1-1',
        requirements: [6, 1],
        description: 'One estate of size 6 and one estate of size 1',
        projectPoints: 7,
        approvedPoints: 4,
      },
      {
        id: 'n1-2',
        requirements: [4, 1, 1],
        description: 'One estate of size 4 and two estates of size 1',
        projectPoints: 6,
        approvedPoints: 3,
      },
      {
        id: 'n1-3',
        requirements: [3, 2, 1],
        description: 'One estate of each size: 3, 2, and 1',
        projectPoints: 8,
        approvedPoints: 4,
      },
      {
        id: 'n1-4',
        requirements: [3, 3],
        description: 'Two estates of size 3',
        projectPoints: 8,
        approvedPoints: 4,
      },
      {
        id: 'n1-5',
        requirements: [2, 2, 2],
        description: 'Three estates of size 2',
        projectPoints: 8,
        approvedPoints: 4,
      },
      {
        id: 'n1-6',
        requirements: [5, 2],
        description: 'One estate of size 5 and one estate of size 2',
        projectPoints: 6,
        approvedPoints: 3,
      },
    ],
  },
  n2: {
    name: 'N°2',
    difficulty: 'Medium',
    pointRange: '9-12 points',
    cards: [
      {
        id: 'n2-1',
        requirements: [4, 4],
        description: 'Two estates of size 4',
        projectPoints: 12,
        approvedPoints: 7,
      },
      {
        id: 'n2-2',
        requirements: [3, 3, 3],
        description: 'Three estates of size 3',
        projectPoints: 12,
        approvedPoints: 7,
      },
      {
        id: 'n2-3',
        requirements: [5, 5],
        description: 'Two estates of size 5',
        projectPoints: 10,
        approvedPoints: 6,
      },
      {
        id: 'n2-4',
        requirements: [6, 3],
        description: 'One estate of size 6 and one estate of size 3',
        projectPoints: 10,
        approvedPoints: 6,
      },
      {
        id: 'n2-5',
        requirements: [5, 2, 2],
        description: 'One estate of size 5 and two estates of size 2',
        projectPoints: 11,
        approvedPoints: 6,
      },
      {
        id: 'n2-6',
        requirements: [4, 1, 1, 1],
        description: 'One estate of size 4 and three estates of size 1',
        projectPoints: 9,
        approvedPoints: 5,
      },
    ],
  },
  n3: {
    name: 'N°3',
    difficulty: 'Hardest',
    pointRange: '11-15 points',
    cards: [
      {
        id: 'n3-1',
        requirements: [1, 1, 1, 1, 1, 1],
        description: 'Six separate estates of size 1',
        projectPoints: 11,
        approvedPoints: 6,
      },
      {
        id: 'n3-2',
        requirements: [2, 2, 2, 2],
        description: 'Four separate estates of size 2',
        projectPoints: 12,
        approvedPoints: 7,
      },
      {
        id: 'n3-3',
        requirements: [3, 3, 3],
        description: 'Three separate estates of size 3',
        projectPoints: 13,
        approvedPoints: 7,
      },
      {
        id: 'n3-4',
        requirements: [4, 4, 1, 1],
        description: 'Two estates of size 4 and two estates of size 1',
        projectPoints: 11,
        approvedPoints: 6,
      },
      {
        id: 'n3-5',
        requirements: [5, 2, 1],
        description: 'One estate of size 5, one of size 2, and one of size 1',
        projectPoints: 12,
        approvedPoints: 7,
      },
      {
        id: 'n3-6',
        requirements: [6, 6],
        description: 'Two estates of size 6',
        projectPoints: 15,
        approvedPoints: 8,
      },
    ],
  },
}

// Get a random card from a specific deck
function getRandomCardFromDeck(deckId, rng = null) {
  const deck = OBJECTIVE_DECKS[deckId]
  if (!deck) return null
  const random = rng ? rng() : Math.random()
  const randomIndex = Math.floor(random * deck.cards.length)
  return deck.cards[randomIndex]
}

// Get one random card from each deck
function getRandomObjectives(rng = null) {
  return {
    n1: getRandomCardFromDeck('n1', rng),
    n2: getRandomCardFromDeck('n2', rng),
    n3: getRandomCardFromDeck('n3', rng),
  }
}

// Get seeded objectives based on a seed number
function getSeededObjectives(seed) {
  // Mulberry32 seeded RNG
  let state = seed
  const rng = function() {
    state |= 0
    state = state + 0x6D2B79F5 | 0
    let t = Math.imul(state ^ state >>> 15, 1 | state)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
  return getRandomObjectives(rng)
}

// Get all cards from a deck
function getDeckCards(deckId) {
  return OBJECTIVE_DECKS[deckId]?.cards || []
}

// Get deck info
function getDeckInfo(deckId) {
  const deck = OBJECTIVE_DECKS[deckId]
  if (!deck) return null
  return {
    id: deckId,
    name: deck.name,
    difficulty: deck.difficulty,
    pointRange: deck.pointRange,
  }
}

export {
  OBJECTIVE_DECKS,
  getRandomCardFromDeck,
  getRandomObjectives,
  getSeededObjectives,
  getDeckCards,
  getDeckInfo,
}

