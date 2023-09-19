package main

import (
	"encoding/json"
	"net/http"

	"github.com/rs/xid"
)

func (s *Server) PutMaterial() http.HandlerFunc {

	type request struct {
		Name   string `json:"name"`
		Parent string `json:"parent"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		user := s.getSessionUser(w, r)
		if user == nil {
			return
		}
		var req request
		if !ReadAsJson(w, r, &req) {
			return
		}
		matId := LowerTrim(req.Name)
		if matId == "" {
			SendBadRequest(w, "material name is empty")
			return
		}

		var material *Material
		err := s.db.EachWhile(MaterialBucket, func(key string, data []byte) bool {
			m, err := readMaterial(data)
			if err != nil || m.User != user.ID {
				return true
			}
			if matId == LowerTrim(m.Name) {
				material = m
				return false
			}
			return true
		})
		if err != nil {
			SendError(w, "failed to search materials", err)
			return
		}

		if material == nil {
			material = &Material{
				ID:     xid.New().String(),
				User:   user.ID,
				Name:   req.Name,
				Parent: req.Parent,
			}
		} else {
			material.Parent = req.Parent
		}
		if err := s.db.Put(MaterialBucket, material); err != nil {
			SendError(w, "failed to save material", err)
		}
	}
}

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
			m, err := readMaterial(data)
			if err != nil {
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

func readMaterial(data []byte) (*Material, error) {
	var material Material
	if err := json.Unmarshal(data, &material); err != nil {
		return nil, err
	}
	return &material, nil
}
