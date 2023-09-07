package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func (s *Server) GetMaterials() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		var materials []*Material
		err := s.db.Each(MaterialBucket, func(key string, data []byte) error {
			var m Material
			if err := json.Unmarshal(data, &m); err != nil {
				return err
			}
			materials = append(materials, &m)
			return nil
		})

		if err != nil {
			log.Println("error: failed to read materials:", err)
			http.Error(w, "failed to get materials", http.StatusInternalServerError)
			return
		}
		ServeAsJson(materials, w)
	}
}
