import type { Card, CardSet, Category } from "./types"

function createPropertiesValidator<T = any>(properties: Record<keyof T, 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'null' | 'undefined' | ((key: string, property: unknown) => boolean)>): (object: unknown) => boolean {
  const validators = Object.fromEntries(Object.entries(properties).map(([key, type]) => [key, typeof type === 'function' ? type : (property: unknown) => typeof property === type]))

  return (object: unknown) => {
    if (typeof object !== 'object' || object === null) {
      return false
    }

    for (const [key, validator] of Object.entries(validators)) {
      if (!(key in object) || !validator(key, object[key as keyof typeof object])) {
        return false
      }
    }

    return true
  }
}

const categoryValidator = createPropertiesValidator<Category>({
  id: 'string',
  letter: 'string',
  color: 'string',
  question: 'string',
  answer: 'string'
})

const cardValidator = createPropertiesValidator<Card>({
  id: 'string',
  name: 'string',
  categories: (_, categories) => Array.isArray(categories) && categories.every(categoryValidator)
})


const cardSetValidator = createPropertiesValidator<CardSet>({
  id: 'string',
  name: 'string',
  defaultCategories: (_, defaultCategories) => Array.isArray(defaultCategories) && defaultCategories.every(categoryValidator),
  cards: (_, cards) => Array.isArray(cards) && cards.every(cardValidator)
})


function isValidCardSet(cardSet: unknown): cardSet is CardSet {
  console.log('isValidCardSet', cardSet, cardSetValidator(cardSet))
  return cardSetValidator(cardSet)
}


export function validateCardSets(cardSets: unknown): CardSet[] {
  if (!Array.isArray(cardSets)) {
    return []
  }

  return cardSets.filter(isValidCardSet)
}