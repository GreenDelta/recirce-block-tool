package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func (s *Server) GetProducts() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		var products []*Product
		err := s.db.Each(ProductBucket, func(key string, data []byte) error {
			var p Product
			if err := json.Unmarshal(data, &p); err != nil {
				return err
			}
			products = append(products, &p)
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
		id := mux.Vars(r)["id"]
		data, err := s.db.Get(ProductBucket, id)
		if data == nil {
			SendNotFound(w, "no product exists for id="+id)
			return
		}
		if err != nil {
			SendError(w, "failed to get product: "+id, err)
			return
		}
		var p Product
		if err := json.Unmarshal(data, &p); err != nil {
			SendError(w, "failed to parse product: "+id, err)
			return
		}
		SendAsJson(w, &p)
	}
}

func (s *Server) PutProduct() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		var product Product
		if !ReadAsJson(w, r, &product) {
			return
		}
		if err := s.db.Put(ProductBucket, &product); err != nil {
			SendError(w, "failed to store product", err)
			return
		}
		w.Write([]byte("ok"))
	}
}
