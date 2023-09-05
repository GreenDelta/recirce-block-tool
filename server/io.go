package main

import (
	"encoding/json"
	"log"
	"net/http"
)

// ServeJSON converts the given entity to a JSON string and writes it to the
// given response.
func ServeJSON(e interface{}, w http.ResponseWriter) {
	if e == nil {
		http.Error(w, "No data", http.StatusInternalServerError)
		return
	}
	data, err := json.Marshal(e)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	ServeJSONBytes(data, w)
}

// ServeJSONBytes writes the given data as JSON content to the given writer. It
// also sets the respective access control headers so that cross domain requests
// are supported.
func ServeJSONBytes(data []byte, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

// DecodeJSON parses the request body as JSON into the given entity. If there is
// an error it directly writes `bad request` to the response.
func DecodeJSON(w http.ResponseWriter, r *http.Request, e interface{}) error {
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(e)
	defer r.Body.Close()
	if err != nil {
		http.Error(w, "could not parse body", http.StatusBadRequest)
	}
	return err
}

// Logs the given error and writes a server error to the response.
func logErr(w http.ResponseWriter, message string, err error) {
	log.Println("ERROR:", message, " :: ", err)
	http.Error(w, "server error", http.StatusInternalServerError)
}
