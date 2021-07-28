package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

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

		s.Emit("game_state", string(json))
    return nil
	})

	server.OnEvent("/", "msg", func(s socketio.Conn, msg string) {
    fmt.Println(s.ID(), "says:", msg)
	})

	server.OnDisconnect("/", func(s socketio.Conn, reason string) {
		fmt.Println("closed", s.ID(), reason)
	})

	http.Handle("/socket.io/", server)
	http.Handle("/", http.FileServer(http.Dir("static")))

	log.Println("Serving at localhost:8000...")

	go server.Serve()
	defer server.Close()

	http.ListenAndServe("localhost:8000", nil)

}