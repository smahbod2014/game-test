package main

import (
	"fmt"
	"log"
	"net/http"

	socketio "github.com/googollee/go-socket.io"
	"github.com/rs/cors"
)

func main() {
	mux := http.NewServeMux()
	server := socketio.NewServer(nil)

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

	

	fs := http.FileServer(http.Dir("static"))
	mux.Handle("/socket.io/", server)
	mux.Handle("/", fs)

	handler := cors.Default().Handler(mux)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
	})

	handler = c.Handler(handler)

	log.Println("Serving at localhost:8000...")

	go server.Serve()
	defer server.Close()

	http.ListenAndServe("localhost:8000", handler)

}