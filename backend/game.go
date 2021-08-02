package main

import (
	"bufio"
	"log"
	"math/rand"
	"os"
	"strings"
)

type Game struct {
	Words           []string
	RedIndexes      []int
	BlueIndexes     []int
	NeutralIndexes  []int
	AssassinIndex   int
	RevealedIndexes []int
	GameOver        bool
}

type GameFlags struct {
	GameState *Game
	Reset     bool
}

var defaultWords []string

func LoadDefaultWords() error {
	f, err := os.Open("word_list.txt")
	if err != nil {
		log.Fatal(err)
		return err
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)

	var words []string
	for scanner.Scan() {
		words = append(words, strings.ToUpper(scanner.Text()))
	}

	if err := scanner.Err(); err != nil {
		log.Fatal(err)
		return err
	}

	defaultWords = words
	return nil
}

func NewGame() *Game {
	numWords := len(defaultWords)
	indexesChosen := map[int]bool{}
	var words []string
	for len(words) < 25 {
		n := rand.Intn(numWords)
		if _, ok := indexesChosen[n]; !ok {
			words = append(words, defaultWords[n])
			indexesChosen[n] = true
		}
	}

	var c [25]int
	for i := 0; i < 25; i++ {
		c[i] = i
	}
	rand.Shuffle(len(c), func(i, j int) { c[i], c[j] = c[j], c[i] })

	return &Game{
		Words:           words,
		RedIndexes:      c[0:9],
		BlueIndexes:     c[9:17],
		NeutralIndexes:  c[17:24],
		AssassinIndex:   c[24],
		RevealedIndexes: []int{},
		GameOver:        false,
	}
}

func (g *Game) ToGameFlags(reset bool) *GameFlags {
	return &GameFlags{
		GameState: g,
		Reset:     reset,
	}
}
