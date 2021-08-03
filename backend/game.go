package main

import (
	"bufio"
	"log"
	"math/rand"
	"os"
	"strings"

	"github.com/mileusna/conditional"
	"github.com/thoas/go-funk"
)

type Game struct {
	Words           []string
	RedIndexes      []int
	BlueIndexes     []int
	NeutralIndexes  []int
	AssassinIndex   int
	RevealedIndexes []int
	GameOver        bool
	WhoseTurn       string
	StartingTeam    string
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

	blueStarts := rand.Intn(2) == 1
	cutoffIndex := 9
	if blueStarts {
		cutoffIndex = 8
	}

	startingTeam := conditional.String(blueStarts, "blue", "red")

	return &Game{
		Words:           words,
		RedIndexes:      c[0:cutoffIndex],
		BlueIndexes:     c[cutoffIndex:17],
		NeutralIndexes:  c[17:24],
		AssassinIndex:   c[24],
		RevealedIndexes: []int{},
		GameOver:        false,
		WhoseTurn:       startingTeam,
		StartingTeam:    startingTeam,
	}
}

func (g *Game) ToGameFlags(reset bool) *GameFlags {
	return &GameFlags{
		GameState: g,
		Reset:     reset,
	}
}

func (g Game) WhoseWord(index int) string {
	if funk.ContainsInt(g.RedIndexes, index) {
		return "red"
	}
	if funk.ContainsInt(g.BlueIndexes, index) {
		return "blue"
	}
	if funk.ContainsInt(g.NeutralIndexes, index) {
		return "neutral"
	}
	return "assassin"
}

func (g Game) GetOppositeTeam() string {
	return conditional.String(g.WhoseTurn == "red", "blue", "red")
}

func (g Game) GetFinishedTeam() string {
	if len(funk.Subtract(g.RedIndexes, g.RevealedIndexes).([]int)) == 0 {
		return "red"
	}
	if len(funk.Subtract(g.BlueIndexes, g.RevealedIndexes).([]int)) == 0 {
		return "blue"
	}
	return ""
}
