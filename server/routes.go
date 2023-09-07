package main

import (
	"net/http"
	"os"
	"path/filepath"
)

func (s *server) mountRoutes() {
	r := s.router

	// user routes (account management)
	r.HandleFunc("/api/users", s.handleGetUsers()).Methods("GET")
	r.HandleFunc("/api/users", s.handlePostUser()).Methods("POST")
	r.HandleFunc("/api/users/login", s.handleLogin()).Methods("POST")
	r.HandleFunc("/api/users/logout", s.handleLogout()).Methods("POST")
	r.HandleFunc("/api/users/current", s.handleGetCurrentUser()).Methods("GET")
	r.HandleFunc("/api/users/{id}", s.handleGetUser()).Methods("GET")
	// self regisration will be enabled later
	// r.HandleFunc("/api/users/signup", s.handleSignUp()).Methods("POST")

	r.HandleFunc("/api/next-id", s.getNextId()).Methods("GET")

	// EPD routes
	/*
		r.HandleFunc("/api/epds", s.handleGetEPDs()).Methods("GET")
		r.HandleFunc("/api/epds", s.handlePostEPD()).Methods("POST")
		r.HandleFunc("/api/epds/{id}", s.handleGetEPD()).Methods("GET")
		r.HandleFunc("/api/epds/{id}", s.handleDeleteEPD()).Methods("DELETE")
		r.HandleFunc("/api/epds/export/pdf/{id}", s.handlePdfExport()).Methods("GET")
		r.HandleFunc("/api/epds/export/docx/{id}", s.handleDocxExport()).Methods("GET")
	*/

	serveHome := func(w http.ResponseWriter, r *http.Request) {
		html, err := os.ReadFile(filepath.Join(s.args.staticDir, "index.html"))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "text/html")
		w.Write(html)
	}

	r.HandleFunc("/", serveHome)
	r.PathPrefix("/ui").HandlerFunc(serveHome)

	// mount static files
	fs := http.FileServer(http.Dir(s.args.staticDir))
	r.PathPrefix("/").Handler(NoCache(fs)) // TODO: NoCache only in dev-mode

}
