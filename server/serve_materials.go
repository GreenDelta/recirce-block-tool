package main

import (
	"encoding/json"
	"net/http"
)

func (s *Server) GetMaterials() http.HandlerFunc {

	type response struct {
		Name   string `json:"name"`
		Parent string `json:"parent"`
	}

	return func(w http.ResponseWriter, r *http.Request) {

		user := s.getSessionUser(w, r)
		if user == nil {
			return
		}

		var materials []*response
		err := s.db.Each(MaterialBucket, func(key string, data []byte) error {
			var m Material
			if err := json.Unmarshal(data, &m); err != nil {
				return err
			}
			if m.User == user.ID {
				materials = append(materials, &response{
					Name:   m.Name,
					Parent: m.Parent,
				})
			}
			return nil
		})

		if err != nil {
			SendError(w, "failed to read materials", err)
			return
		}
		SendAsJson(w, materials)
	}
}
