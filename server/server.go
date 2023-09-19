package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
)

type Server struct {
	args    *Args
	db      *DB
	cookies *sessions.CookieStore
	router  *mux.Router
}

func (s *Server) Session(r *http.Request) *sessions.Session {
	ses, err := s.cookies.Get(r, "recirce-block-tool")
	if err != nil {
		log.Println("failed to get session:", err)
		return nil
	}
	return ses
}

func (s *Server) Serve() error {
	s.mountRoutes()
	s.addShutdownHook()
	args := s.args
	log.Println("starting server at port:", args.port)
	return http.ListenAndServe(":"+args.port, s.router)
}

func (s *Server) addShutdownHook() {
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

func (s *Server) mountRoutes() {
	r := s.router

	// user routes (account management)
	r.HandleFunc("/api/users", s.GetUsers()).Methods("GET")
	r.HandleFunc("/api/users", s.PostUser()).Methods("POST")
	r.HandleFunc("/api/users/login", s.PostLogin()).Methods("POST")
	r.HandleFunc("/api/users/logout", s.PostLogout()).Methods("POST")
	r.HandleFunc("/api/users/current", s.GetCurrentUser()).Methods("GET")
	r.HandleFunc("/api/users/{id}", s.GetUser()).Methods("GET")
	// self regisration will be enabled later
	// r.HandleFunc("/api/users/signup", s.handleSignUp()).Methods("POST")

	r.HandleFunc("/api/materials", s.GetMaterials()).Methods("GET")
	r.HandleFunc("/api/materials", s.PutMaterial()).Methods("POST", "PUT")
	r.HandleFunc("/api/products/{id}", s.GetProduct()).Methods("GET")
	r.HandleFunc("/api/products", s.GetProducts()).Methods("GET")
	r.HandleFunc("/api/products", s.PutProduct()).Methods("POST", "PUT")

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
