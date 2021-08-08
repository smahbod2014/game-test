package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"time"

	socketio "github.com/googollee/go-socket.io"
	"github.com/googollee/go-socket.io/engineio"
	"github.com/googollee/go-socket.io/engineio/transport"
	"github.com/googollee/go-socket.io/engineio/transport/polling"
	"github.com/googollee/go-socket.io/engineio/transport/websocket"
	"github.com/gorilla/mux"
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

	server.OnEvent("/", "join_decrypto", func(s socketio.Conn, msg string) {
		s.Join("decrypto")
	})

	server.OnEvent("/", "decrypto_text", func(s socketio.Conn, msg string) {
		fmt.Println(s.ID(), "decrypto_text", msg)

		server.ForEach("/", "decrypto", func(c socketio.Conn) {
			if c.ID() != s.ID() {
				c.Emit("text_event", msg)
			}
		})
	})

	server.OnError("/", func(c socketio.Conn, e error) {
		log.Fatal("error:", e)
	})

	server.OnDisconnect("/", func(s socketio.Conn, reason string) {
		fmt.Println("closed", s.ID(), reason)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8555"
	}

	log.Println("Listening on port", port)

	go server.Serve()
	defer server.Close()

	router := mux.NewRouter()

	router.Handle("/socket.io/", server)
	router.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]bool{"ok": true})
	})
	spa := spaHandler{staticPath: "build", indexPath: "index.html"}
	router.PathPrefix("/").Handler(spa)

	srv := &http.Server{
		Handler: router,
		Addr:    ":" + port,
		// Good practice: enforce timeouts for servers you create!
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Fatal(srv.ListenAndServe())

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

type spaHandler struct {
	staticPath string
	indexPath  string
}

// ServeHTTP inspects the URL path to locate a file within the static dir
// on the SPA handler. If a file is found, it will be served. If not, the
// file located at the index path on the SPA handler will be served. This
// is suitable behavior for serving an SPA (single page application).
func (h spaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// get the absolute path to prevent directory traversal
	path, err := filepath.Abs(r.URL.Path)
	if err != nil {
		// if we failed to get the absolute path respond with a 400 bad request
		// and stop
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// prepend the path with the path to the static directory
	path = filepath.Join(h.staticPath, path)

	// check whether a file exists at the given path
	_, err = os.Stat(path)
	if os.IsNotExist(err) {
		// file does not exist, serve index.html
		http.ServeFile(w, r, filepath.Join(h.staticPath, h.indexPath))
		return
	} else if err != nil {
		// if we got an error (that wasn't that the file doesn't exist) stating the
		// file, return a 500 internal server error and stop
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// otherwise, use http.FileServer to serve the static dir
	http.FileServer(http.Dir(h.staticPath)).ServeHTTP(w, r)
}
