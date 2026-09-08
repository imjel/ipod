import { Suits, type Card, CARD_VALUES } from "./solitaire.types";

export function shuffleDeck(cards: Card[]) {
  // shuffle with random swaps (fisher-yates):
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

// initialize 52 card deck
export function createNewDeck(): Card[] {
  let deck: Card[] = [];

  Suits.forEach((suit) => {
    CARD_VALUES.forEach((value) => {
      deck.push({ suit: suit, value: value });
    });
  });
  return deck;
}

// return absolute value of difference between cards
export function compareCards(card1: Card, card2: Card) {
  return Math.abs(card1.value - card2.value);
}
