package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func SendError(w http.ResponseWriter, msg string, err error) {
	log.Println(msg, err)
	http.Error(w, msg, http.StatusInternalServerError)
}

func SendBadRequest(w http.ResponseWriter, msg string) {
	http.Error(w, msg, http.StatusBadRequest)
}

func SendNotFound(w http.ResponseWriter, msg string) {
	http.Error(w, msg, http.StatusNotFound)
}

func SendAsJson(w http.ResponseWriter, e interface{}) {
	if e == nil {
		http.Error(w, "No data", http.StatusInternalServerError)
		return
	}
	data, err := json.Marshal(e)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	SendJson(data, w)
}

func SendJson(data []byte, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func ReadAsJson(w http.ResponseWriter, r *http.Request, e interface{}) bool {
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(e)
	defer r.Body.Close()
	if err != nil {
		http.Error(w, "could not parse body", http.StatusBadRequest)
		return false
	}
	return true
}
