import { validateCardSet } from "./localStorage";
import type { CardSet } from "./types";

export function importCardSet(importString: string): CardSet | null {
  try {
    const cardSet = JSON.parse(importString)
    return validateCardSet(cardSet)
  } catch (error) {
    console.error('Error importing card set:', error)
    return null
  }
}

export function exportCardSet(cardSet: CardSet): string {
  return JSON.stringify(cardSet)
}