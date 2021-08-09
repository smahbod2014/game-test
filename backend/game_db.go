package main

type GameDB struct {
	CodenamesDB map[string]*Game
	DecryptoDB  map[string]*DecryptoState
}

func CreateGameDB() *GameDB {
	return &GameDB{
		CodenamesDB: make(map[string]*Game),
		DecryptoDB:  make(map[string]*DecryptoState),
	}
}

func (g *GameDB) AddCodenamesGame(id string, game *Game) {
	g.CodenamesDB[id] = game
}

func (g GameDB) GetCodenamesGame(id string) *Game {
	return g.CodenamesDB[id]
}

func (g *GameDB) AddDecryptoGame(id string, game *DecryptoState) {
	g.DecryptoDB[id] = game
}

func (g GameDB) GetDecryptoGame(id string) *DecryptoState {
	return g.DecryptoDB[id]
}
