package main

import (
	"net/http"
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
		if req.Name == "" {
			SendBadRequest(w, "material name is empty")
			return
		}
		material, err := s.db.FindMaterial(user, req.Name)
		if err != nil {
			SendError(w, "failed to search materials", err)
			return
		}
		if material == nil {
			if _, err := s.db.CreateMaterial(user, req.Name, req.Parent); err != nil {
				SendError(w, "failed to create material", err)
			}
		} else {
			material.Parent = req.Parent
			if err := s.db.PutMaterial(user, material); err != nil {
				SendError(w, "failed to update material", err)
			}
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
		materials, err := s.db.GetMaterials(user)
		if err != nil {
			SendError(w, "failed to read materials", err)
			return
		}
		var list []*response
		for _, m := range materials {
			list = append(list, &response{
				Name:   m.Name,
				Parent: m.Parent,
			})
		}
		SendAsJson(w, list)
	}
}
