package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
)

type server struct {
	args    *Args
	db      *DB
	cookies *sessions.CookieStore
	router  *mux.Router
}

func main() {

	args := ReadArgs()
	data, err := InitDataDir(args.dataDir)
	if err != nil {
		log.Fatalln("failed to initialize data folder:", err)
	}

	server := &server{
		args:    args,
		db:      data.db,
		cookies: data.cookies,
		router:  mux.NewRouter(),
	}
	server.mountRoutes()
	server.AddShutdownHook()

	log.Println("starting server at port:", args.port)
	if err := http.ListenAndServe(":"+args.port, server.router); err != nil {
		log.Println("ERROR: failed to start server:", err)
	}
}

func (s *server) AddShutdownHook() {
	ossignals := make(chan os.Signal, 1)
	signal.Notify(ossignals, syscall.SIGTERM)
	signal.Notify(ossignals, syscall.SIGINT)
	go func() {
		<-ossignals
		log.Println("shutdown server")
		if err := s.db.Close(); err != nil {
			log.Fatal("Failed to close database", err)
		}
		os.Exit(0)
	}()
}
