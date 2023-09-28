package main

import (
	"net/http"
)

func (s *Server) GetProducts() http.HandlerFunc {
	return GetUserEntities(s, ProductBucket, NewProduct)
}

func (s *Server) GetProduct() http.HandlerFunc {
	return GetUserEntity(s, ProductBucket, NewProduct)
}

func (s *Server) PutProduct() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		user := s.getSessionUser(w, r)
		if user == nil {
			return
		}
		var product Product
		if !ReadAsJson(w, r, &product) {
			return
		}
		if err := s.db.PutProduct(user, &product); err != nil {
			SendError(w, "failed to store product", err)
		}
		w.Write([]byte("ok"))
	}
}
