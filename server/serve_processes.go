package main

import (
	"encoding/json"
	"net/http"
)

func (s *Server) GetProcesses() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		user := s.getSessionUser(w, r)
		if user == nil {
			return
		}
		var names []string
		err := s.db.Each(ProcessBucket, func(key string, data []byte) error {
			var p Process
			if err := json.Unmarshal(data, &p); err != nil {
				return err
			}
			names = append(names, p.Name)
			return nil
		})
		if err != nil {
			SendError(w, "failed to read processes", err)
			return
		}
		SendAsJson(w, names)
	}
}

func (s *Server) PutProcess() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		user := s.getSessionUser(w, r)
		if user == nil {
			return
		}
		if !user.IsAdmin {
			http.Error(w, "not an admin", http.StatusForbidden)
			return
		}
		var process Process
		if !ReadAsJson(w, r, &process) {
			return
		}
		if err := s.db.Put(ProcessBucket, &process); err != nil {
			SendError(w, "failed to store product", err)
		}
		w.Write([]byte("ok"))
	}
}
