package main

import (
	"net/http"
	"time"

	"github.com/rs/xid"
)

func nextId() string {
	return xid.NewWithTime(time.Now()).String()
}

func (s *Server) getNextId() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := nextId()
		w.Header().Set("Content-Type", "text/plain")
		w.Write([]byte(id))
	}
}
