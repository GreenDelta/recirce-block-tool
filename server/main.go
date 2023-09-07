package main

import (
	"log"

	"github.com/gorilla/mux"
)

func main() {

	args := ReadArgs()
	data, err := InitDataDir(args.dataDir)
	if err != nil {
		log.Fatalln("failed to initialize data folder:", err)
	}

	server := &Server{
		args:    args,
		db:      data.db,
		cookies: data.cookies,
		router:  mux.NewRouter(),
	}
	if err := server.Serve(); err != nil {
		log.Fatalln("failed to start server:", err)
	}
}
