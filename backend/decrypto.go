package main

import (
	"math/rand"
	"strconv"

	"modernc.org/mathutil"
)

type TextEvent struct {
	ElementID string
	Value     string
	GameID string
}

type ScoreEvent struct {
	Color string
	Change int
	Variable string
	GameID string
}

type DecryptoState struct {
	Content                map[string]string
	WhiteWords             []string
	BlackWords             []string
	WhiteMiscommunications int
	BlackMiscommunications int
	WhiteInterceptions     int
	BlackInterceptions     int
	WhiteTeamName          string
	BlackTeamName          string
}

type DecryptoWithFlags struct {
	State *DecryptoState
	Reset     bool
}

func NewDecryptoGame(wordList []string) *DecryptoState {
	content := map[string]string{}
	for _, color := range []string{"white", "black"} {
		for i := 0; i < 24; i++ {
			content["input-"+color+"-"+strconv.Itoa(i)] = ""
		}
		for i := 0; i < 24; i++ {
			content["guess-"+color+"-"+strconv.Itoa(i)] = ""
		}
		for i := 0; i < 24; i++ {
			content["correct-"+color+"-"+strconv.Itoa(i)] = ""
		}
		for i := 0; i < 4; i++ {
			content["answer-"+color+"-"+strconv.Itoa(i)] = ""
		}
	}

	indexesChosen := map[int]bool{}
	var words []string
	for len(words) < 8 {
		n := rand.Intn(len(wordList))
		if _, ok := indexesChosen[n]; !ok {
			words = append(words, wordList[n])
			indexesChosen[n] = true
		}
	}
	
	return &DecryptoState{
		Content:   content,
		WhiteWords: words[0:4],
		BlackWords: words[4:8],
	}
}

func (d *DecryptoState) WithFlags(reset bool) *DecryptoWithFlags {
	return &DecryptoWithFlags{
		State: d,
		Reset:     reset,
	}
}

func (d *DecryptoState) UpdateScore(event *ScoreEvent) {
	if (event.Color == "white") {
		if (event.Variable == "miscommunication") {
			d.WhiteMiscommunications += event.Change
		} else {
			d.WhiteInterceptions += event.Change
		}
	} else {
		if (event.Variable == "miscommunication") {
			d.BlackMiscommunications += event.Change
		} else {
			d.BlackInterceptions += event.Change
		}
	}

	d.WhiteMiscommunications = mathutil.Clamp(d.WhiteMiscommunications, 0, 2)
	d.WhiteInterceptions = mathutil.Clamp(d.WhiteInterceptions, 0, 2)
	d.BlackMiscommunications = mathutil.Clamp(d.BlackMiscommunications, 0, 2)
	d.BlackInterceptions = mathutil.Clamp(d.BlackInterceptions, 0, 2)
}
