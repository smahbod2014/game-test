package main

type GameDB struct {
	db map[string]*Game
}

func CreateGameDB() *GameDB {
	return &GameDB{
		db: make(map[string]*Game),
	}
}

func (g *GameDB) AddGame(id string, game *Game) {
	g.db[id] = game
}

func (g GameDB) GetGame(id string) *Game {
	return g.db[id]
}
