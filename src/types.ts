export interface Category {
  id: string
  letter: string
  color: string
  question: string
  answer: string
}

export interface Card {
  id: string
  name: string
  categories: Category[]
}

export const CARD_WIDTH = 848
export const CARD_HEIGHT = 380

// Full card dimensions (questions + answers stacked)
export const FULL_CARD_WIDTH = CARD_WIDTH
export const FULL_CARD_HEIGHT = CARD_HEIGHT * 2

// Preset colors matching Trivia Pursuit aesthetic
export const PRESET_COLORS = [
  { name: 'Teal', value: '#5B9AA0' },
  { name: 'Pink', value: '#E57F9D' },
  { name: 'Yellow', value: '#E5C54D' },
  { name: 'Brown', value: '#8B6B4F' },
  { name: 'Green', value: '#4A7C59' },
  { name: 'Orange', value: '#D96841' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Slate', value: '#64748B' },
]

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'category-1', letter: 'A', color: '#5B9AA0', question: '', answer: '' },
  { id: 'category-2', letter: 'B', color: '#E57F9D', question: '', answer: '' },
  { id: 'category-3', letter: 'C', color: '#E5C54D', question: '', answer: '' },
  { id: 'category-4', letter: 'D', color: '#8B6B4F', question: '', answer: '' },
  { id: 'category-5', letter: 'E', color: '#4A7C59', question: '', answer: '' },
  { id: 'category-6', letter: 'F', color: '#D96841', question: '', answer: '' },
]

// Helper to determine if a color needs dark text
export function needsDarkText(color: string): boolean {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

// Helper to create a new category with next letter and random color
export function createNewCategory(existingCategories: Category[], defaultCategories: Category[] = []): Category {
  const possibleDefaultCategory = defaultCategories.find(c => !existingCategories.some(e => e.letter === c.letter || e.color === c.color))

  if (possibleDefaultCategory) {
    return {
      ...possibleDefaultCategory,
      id: `category-${crypto.randomUUID()}`
    }
  }


  // Find the next letter
  const usedLetters = new Set(existingCategories.map(c => c.letter))
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let nextLetter = '?'
  
  for (const letter of alphabet) {
    if (!usedLetters.has(letter)) {
      nextLetter = letter
      break
    }
  }
  
  // Pick a random color that's not already used (if possible)
  const usedColors = new Set(existingCategories.map(c => c.color))
  const availableColors = PRESET_COLORS.filter(c => !usedColors.has(c.value))
  const colorPool = availableColors.length > 0 ? availableColors : PRESET_COLORS
  const randomIndex = Math.floor(Math.random() * colorPool.length)
  const randomColor = colorPool[randomIndex] ?? PRESET_COLORS[0]
  
  return {
    id: `category-${crypto.randomUUID()}`,
    letter: nextLetter,
    color: randomColor!.value,
    question: '',
    answer: ''
  }
}

// Helper to create a new card with default categories
export function createNewCard(existingCards: Card[], defaultCategories: Category[] = DEFAULT_CATEGORIES): Card {
  const id = `card-${crypto.randomUUID()}`
  const name = `Card ${existingCards.length + 1}`
  return {
    id,
    name,
    categories: defaultCategories.map(cat => ({ ...cat, id: `category-${crypto.randomUUID()}` }))
  }
}

export interface CardSet {
  id: string
  name: string
  defaultCategories: Category[]
  cards: Card[]
}

export const DefaultCardSet: CardSet = {
  id: `card-set-${crypto.randomUUID()}`,
  name: 'Default Card Set',
  cards: [createNewCard([], DEFAULT_CATEGORIES)],
  defaultCategories: DEFAULT_CATEGORIES.map(cat => ({ ...cat })),
}
