package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	socketio "github.com/googollee/go-socket.io"
	"github.com/googollee/go-socket.io/engineio"
	"github.com/googollee/go-socket.io/engineio/transport"
	"github.com/googollee/go-socket.io/engineio/transport/polling"
	"github.com/googollee/go-socket.io/engineio/transport/websocket"
)

var allowOriginFunc = func(r *http.Request) bool {
	return true
}

func main() {
	gameDB := CreateGameDB()
	gameDB.AddGame("test_id", NewGame())

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
		json, err := json.Marshal(gameDB.GetGame("test_id"))
		if err != nil {
			return err
		}

		s.Join("game")
		s.Emit("game_state", string(json))
		return nil
	})

	server.OnEvent("/", "msg", func(s socketio.Conn, msg string) {
		fmt.Println(s.ID(), "says:", msg)
	})

	server.OnEvent("/", "selection", func(s socketio.Conn, msg string) {
		fmt.Println(s.ID(), "clicks:", msg)
		index, err := strconv.Atoi(msg)
		if err != nil {
			log.Fatal(err)
			return
		}
		game := gameDB.GetGame("test_id")
		for _, v := range game.RevealedIndexes {
			if v == index {
				return
			}
		}
		game.RevealedIndexes = append(game.RevealedIndexes, index)
		json, err := json.Marshal(game)
		if err != nil {
			log.Fatal(err)
			return
		}
		server.BroadcastToRoom("/", "game", "game_state", string(json))
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
