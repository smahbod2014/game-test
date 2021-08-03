package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	socketio "github.com/googollee/go-socket.io"
	"github.com/googollee/go-socket.io/engineio"
	"github.com/googollee/go-socket.io/engineio/transport"
	"github.com/googollee/go-socket.io/engineio/transport/polling"
	"github.com/googollee/go-socket.io/engineio/transport/websocket"
	"github.com/mileusna/conditional"
)

var allowOriginFunc = func(r *http.Request) bool {
	return true
}

func main() {
	rand.Seed(time.Now().UnixNano())
	if err := LoadDefaultWords(); err != nil {
		log.Fatal(err)
		return
	}

	gameDB := CreateGameDB()

	server := socketio.NewServer(&engineio.Options{
		Transports: []transport.Transport{
			&polling.Transport{
				CheckOrigin: allowOriginFunc,
			},
			&websocket.Transport{
				CheckOrigin: allowOriginFunc,
			},
		},
	})

	server.OnConnect("/", func(s socketio.Conn) error {
		fmt.Println("connected:", s.ID())
		return nil
	})

	server.OnEvent("/", "join", func(s socketio.Conn, gameID string) {
		fmt.Println(s.ID(), "joins", gameID)

		game := gameDB.GetGame(gameID)
		if game == nil {
			game = NewGame()
			gameDB.AddGame(gameID, game)
		}
		json, err := json.Marshal(game.ToGameFlags(false))
		if err != nil {
			log.Fatal(err)
			return
		}
		s.Join("game_" + gameID)
		s.Emit("game_state", string(json))
	})

	server.OnEvent("/", "msg", func(s socketio.Conn, msg string) {
		fmt.Println(s.ID(), "says:", msg)
	})

	server.OnEvent("/", "new_game", func(s socketio.Conn, gameID string) {
		fmt.Println(s.ID(), "initiates new game")
		game := NewGame()
		gameDB.AddGame(gameID, game)
		BroadcastGameState(game.ToGameFlags(true), gameID, server)
	})

	server.OnEvent("/", "selection", func(s socketio.Conn, msg string) {
		var selection *Selection
		err := json.Unmarshal([]byte(msg), &selection)
		if err != nil {
			log.Fatal(err)
			return
		}

		fmt.Println(s.ID(), "from game", selection.GameID, "clicks:", msg)

		game := gameDB.GetGame(selection.GameID)
		for _, v := range game.RevealedIndexes {
			if v == selection.Index {
				return
			}
		}
		game.WhoseTurn = conditional.String(game.WhoseWord(selection.Index) == game.WhoseTurn, game.WhoseTurn, game.GetOppositeTeam())
		game.RevealedIndexes = append(game.RevealedIndexes, selection.Index)
		game.GameOver = selection.Index == game.AssassinIndex || game.GetFinishedTeam() != ""
		BroadcastGameState(game.ToGameFlags(false), selection.GameID, server)
	})

	server.OnEvent("/", "pass", func(s socketio.Conn, gameID string) {
		game := gameDB.GetGame(gameID)
		game.WhoseTurn = game.GetOppositeTeam()
		BroadcastGameState(game.ToGameFlags(false), gameID, server)
	})

	server.OnError("/", func(c socketio.Conn, e error) {
		log.Fatal(e)
	})

	server.OnDisconnect("/", func(s socketio.Conn, reason string) {
		fmt.Println("closed", s.ID(), reason)
	})

	http.Handle("/socket.io/", server)
	http.Handle("/", http.FileServer(http.Dir("static")))

	log.Println("Serving at localhost:8555...")

	go server.Serve()
	defer server.Close()

	http.ListenAndServe("localhost:8555", nil)

	log.Println("Shutting down")
}

func BroadcastGameState(gameState *GameFlags, gameID string, server *socketio.Server) {
	json, err := json.Marshal(gameState)
	if err != nil {
		log.Fatal(err)
		return
	}
	server.BroadcastToRoom("/", "game_"+gameID, "game_state", string(json))
}
