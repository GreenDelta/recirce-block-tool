package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"

	"github.com/gorilla/mux"
	"github.com/gorilla/securecookie"
	"github.com/gorilla/sessions"
	"github.com/rs/xid"
)

type server struct {
	args    *args
	db      *DB
	cookies *sessions.CookieStore
	router  *mux.Router
}

func main() {

	args := readArgs()

	// initialize the data folder
	log.Println("init data folder", args.dataDir)
	for _, folder := range []string{args.dataDir} {
		err := os.MkdirAll(folder, os.ModePerm)
		if err != nil {
			log.Println("ERROR: failed to create data folder", folder)
			return
		}
	}

	server := &server{
		args:    args,
		db:      initDB(args.dataDir),
		cookies: initCookieStore(args),
		router:  mux.NewRouter(),
	}
	server.mountRoutes()

	log.Println("Register shutdown routines")
	ossignals := make(chan os.Signal, 1)
	signal.Notify(ossignals, syscall.SIGTERM)
	signal.Notify(ossignals, syscall.SIGINT)
	go func() {
		<-ossignals
		log.Println("Shutdown server")
		err := server.db.Close()
		if err != nil {
			log.Fatal("Failed to close database", err)
		}
		os.Exit(0)
	}()

	log.Println("Starting server at port:", args.port)
	if err := http.ListenAndServe(":"+args.port, server.router); err != nil {
		log.Println("ERROR: failed to start server;", err)
	}
}

func initCookieStore(args *args) *sessions.CookieStore {
	log.Println("Init cookie store ...")
	keyPath := filepath.Join(args.dataDir, "cookies.key")
	_, err := os.Stat(keyPath)
	if err != nil && !os.IsNotExist(err) {
		log.Fatalln("Cannot access cookie key at", keyPath, err)
	}
	var key []byte
	if os.IsNotExist(err) {
		key = securecookie.GenerateRandomKey(32)
		err = os.WriteFile(keyPath, key, os.ModePerm)
		if err != nil {
			log.Fatalln("Failed to save", keyPath, ": ", err)
		}
	} else {
		key, err = os.ReadFile(keyPath)
		if err != nil {
			log.Fatalln("Failed to read", keyPath, ": ", err)
		}
	}
	return sessions.NewCookieStore(key)
}

func initDB(dir string) *DB {
	db, err := openDB(dir)
	if err != nil {
		log.Println("ERROR: failed to init database:", err)
		os.Exit(1)
	}

	// assure that we have at least one admin in the database
	adminFound := false
	db.EachWhile(AccountBucket, func(key string, data []byte) bool {
		var account User
		if err := json.Unmarshal(data, &account); err != nil {
			log.Println("ERROR: failed to unmarshall account:", err)
			return true
		}
		if account.IsAdmin {
			adminFound = true
			return false
		}
		return true
	})
	if adminFound {
		return db
	}

	// create an admin
	account := &User{
		Email:   "@admin",
		Name:    "Admin",
		IsAdmin: true,
	}
	account.ID = xid.New().String()
	hash, err := hashPassword("admin")
	if err != nil {
		log.Println("ERROR: failed to generate password hash for admin:", err)
		os.Exit(1)
	}
	account.Hash = hash
	if err := db.Put(AccountBucket, account); err != nil {
		log.Println("ERROR: failed to save default admin:", err)
		os.Exit(1)
	}
	log.Println("WARNING: created default admin; " +
		"you should set another password")
	return db
}
