package main

type Game struct {
	Words           []string
	RedIndexes      []int
	BlueIndexes     []int
	NeutralIndexes  []int
	AssassinIndex   int
	RevealedIndexes []int
}

func NewGame() *Game {
	var words []string
	for i := 0; i < 25; i++ {
		words = append(words, string('A'+i))
	}
	return &Game{
		Words:           words,
		RedIndexes:      []int{0, 1, 2, 3, 4, 5, 6, 7, 8},
		BlueIndexes:     []int{9, 10, 11, 12, 13, 14, 15, 16},
		NeutralIndexes:  []int{17, 18, 19, 20, 21, 22, 23},
		AssassinIndex:   24,
		RevealedIndexes: []int{},
	}
}
