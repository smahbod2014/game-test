package main

import (
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

	server.OnEvent("/", "connection", func(s socketio.Conn) {
    fmt.Println("connection:", s.ID())
	})

	server.OnEvent("/", "msg", func(s socketio.Conn, msg string) {
    fmt.Println("got message:", msg)
	})

	// server.OnError("/", func(s socketio.Conn, e error) {
	// 	id := "nil"
	// 	if s != nil {
	// 		id = s.ID();
	// 	}
	// 	fmt.Println("on error:", id, e)
	// })

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