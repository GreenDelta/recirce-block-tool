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
	db     *DB
	cookie *sessions.CookieStore
}

func main() {

	args := readArgs()

	log.Println("init data folder", args.dataDir)
	for _, folder := range []string{args.dataDir} {
		err := os.MkdirAll(folder, os.ModePerm)
		if err != nil {
			log.Println("ERROR: failed to create data folder", folder)
			return
		}
	}
	s := &server{}
	s.db = initDB(args.dataDir)
	s.cookie = initCookieStore(args)

	log.Println("Create server with static files from:", args.staticDir)
	r := mux.NewRouter()

	// user routes (account management)
	r.HandleFunc("/api/users", s.handleGetUsers()).Methods("GET")
	r.HandleFunc("/api/users", s.handlePostUser()).Methods("POST")
	r.HandleFunc("/api/users/login", s.handleLogin()).Methods("POST")
	r.HandleFunc("/api/users/logout", s.handleLogout()).Methods("POST")
	r.HandleFunc("/api/users/current", s.handleGetCurrentUser()).Methods("GET")
	r.HandleFunc("/api/users/{id}", s.handleGetUser()).Methods("GET")
	// self regisration will be enabled later
	// r.HandleFunc("/api/users/signup", s.handleSignUp()).Methods("POST")

	// EPD routes
	/*
		r.HandleFunc("/api/epds", s.handleGetEPDs()).Methods("GET")
		r.HandleFunc("/api/epds", s.handlePostEPD()).Methods("POST")
		r.HandleFunc("/api/epds/{id}", s.handleGetEPD()).Methods("GET")
		r.HandleFunc("/api/epds/{id}", s.handleDeleteEPD()).Methods("DELETE")
		r.HandleFunc("/api/epds/export/pdf/{id}", s.handlePdfExport()).Methods("GET")
		r.HandleFunc("/api/epds/export/docx/{id}", s.handleDocxExport()).Methods("GET")
	*/

	r.PathPrefix("/ui/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		html, err := os.ReadFile(filepath.Join(args.staticDir, "index.html"))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "text/html")
		w.Write(html)
	})
	fs := http.FileServer(http.Dir(args.staticDir))
	r.PathPrefix("/").Handler(NoCache(fs)) // TODO: NoCache only in dev-mode

	log.Println("Register shutdown routines")
	ossignals := make(chan os.Signal)
	signal.Notify(ossignals, syscall.SIGTERM)
	signal.Notify(ossignals, syscall.SIGINT)
	go func() {
		<-ossignals
		log.Println("Shutdown server")
		err := s.db.Close()
		if err != nil {
			log.Fatal("Failed to close database", err)
		}
		os.Exit(0)
	}()

	log.Println("Starting server at port:", args.port)
	http.ListenAndServe(":"+args.port, r)
}

func initCookieStore(args *args) *sessions.CookieStore {
	log.Println("Init cookie store ...")
	keyPath := filepath.Join(args.dataDir, "cookie_auth.key")
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
	db, err := newDB(dir)
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
