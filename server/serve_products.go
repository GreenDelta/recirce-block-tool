package main

import (
	"encoding/json"
	"net/http"
)

func (s *Server) PutProduct() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		var product Product
		if err := DecodeJSON(w, r, &product); err != nil {
			http.Error(w, "invalid product data", http.StatusBadRequest)
			return
		}

		if err := s.db.Put(ProductBucket, &product); err != nil {
			http.Error(w, "failed to store product", http.StatusInternalServerError)
			return
		}

		w.Write([]byte("ok"))
	}
}

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
			http.Error(w, "failed to get products", http.StatusInternalServerError)
			return
		}
		ServeAsJson(products, w)
	}
}
