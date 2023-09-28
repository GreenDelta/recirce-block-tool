package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func (s *Server) GetScenarios() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := s.getSessionUser(w, r)
		if user == nil {
			return
		}
		if scenarios, err := s.db.GetScenarios(user); err != nil {
			SendError(w, "failed to get scenarios", err)
		} else {
			SendAsJson(w, scenarios)
		}
	}
}

func (s *Server) GetScenario() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := s.getSessionUser(w, r)
		if user == nil {
			return
		}
		id := mux.Vars(r)["id"]
		data, err := s.db.Get(ScenarioBucket, id)
		if err != nil {
			SendError(w, "failed to get scenario: "+id, err)
			return
		}
		if data == nil {
			SendNotFound(w, "no scenario exists for id="+id)
			return
		}

		var scenario Scenario
		if err := json.Unmarshal(data, &scenario); err != nil {
			SendError(w, "failed to parse scenario: "+id, err)
			return
		}
		if scenario.User != user.ID {
			http.Error(w, "not allowed", http.StatusUnauthorized)
			return
		}
		scenario.User = ""

		SendAsJson(w, &scenario)
	}
}

func (s *Server) PutScenario() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := s.getSessionUser(w, r)
		if user == nil {
			return
		}
		var scenario Scenario
		if !ReadAsJson(w, r, &scenario) {
			return
		}
		if err := s.db.PutScenario(user, &scenario); err != nil {
			SendError(w, "failed to store scenario", err)
			return
		}
		w.Write([]byte("ok"))
	}
}
