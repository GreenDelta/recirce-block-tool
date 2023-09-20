package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func (s *Server) GetProducts() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		user := s.getSessionUser(w, r)
		if user == nil {
			return
		}

		var products []*Product
		err := s.db.Each(ProductBucket, func(key string, data []byte) error {
			var p Product
			if err := json.Unmarshal(data, &p); err != nil {
				return err
			}
			if p.User == user.ID {
				products = append(products, &p)
			}
			return nil
		})

		if err != nil {
			SendError(w, "failed to get products", err)
			return
		}
		SendAsJson(w, products)
	}
}

func (s *Server) GetProduct() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		user := s.getSessionUser(w, r)
		if user == nil {
			return
		}

		id := mux.Vars(r)["id"]
		data, err := s.db.Get(ProductBucket, id)
		if err != nil {
			SendError(w, "failed to get product: "+id, err)
			return
		}
		if data == nil {
			SendNotFound(w, "no product exists for id="+id)
			return
		}

		var p Product
		if err := json.Unmarshal(data, &p); err != nil {
			SendError(w, "failed to parse product: "+id, err)
			return
		}
		if p.User != user.ID {
			http.Error(w, "not allowed", http.StatusUnauthorized)
			return
		}
		p.User = ""

		SendAsJson(w, &p)
	}
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
		product.User = user.ID
		if err := s.db.Put(ProductBucket, &product); err != nil {
			SendError(w, "failed to store product", err)
			return
		}
		w.Write([]byte("ok"))
	}
}
