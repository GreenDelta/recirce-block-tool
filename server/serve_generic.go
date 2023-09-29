package main

import (
	"net/http"

	"github.com/gorilla/mux"
)

func GetUserEntities[T UserEntity](
	s *Server, bucket Bucket, f func() T,
) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		user := s.getSessionUser(w, r)
		if user == nil {
			return
		}
		if ts, err := ReadUserEntities(s.db, bucket, user, f); err != nil {
			SendError(w, "failed read: "+string(bucket), err)
		} else {
			SendAsJson(w, ts)
		}
	}
}

func GetUserEntity[T UserEntity](
	s *Server, bucket Bucket, f func() T,
) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		user := s.getSessionUser(w, r)
		if user == nil {
			return
		}

		id := mux.Vars(r)["id"]
		data, err := s.db.Get(bucket, id)
		if err != nil {
			SendError(w,
				"failed to get id="+id+" from: "+string(bucket), err)
			return
		}

		entity, err := ParseEntity[T](data, f)
		if err != nil {
			SendError(w,
				"failed to read id="+id+" from: "+string(bucket), err)
			return
		}

		if entity.UserID() != user.ID {
			http.Error(w, "not allowed", http.StatusUnauthorized)
			return
		}

		entity.SetUserID("")
		SendAsJson(w, entity)
	}
}

func PutUserEntity[T UserEntity](
	s *Server, bucket Bucket, f func() T,
) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		user := s.getSessionUser(w, r)
		if user == nil {
			return
		}
		t := f()
		if !ReadAsJson(w, r, t) {
			return
		}
		if err := WriteUserEntity(s.db, bucket, user, t); err != nil {
			SendError(w, "failed to write to: "+string(bucket), err)
		} else {
			w.WriteHeader(http.StatusOK)
		}
	}
}

func DeleteUserEntity[T UserEntity](
	s *Server, bucket Bucket, f func() T,
) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		user := s.getSessionUser(w, r)
		if user == nil {
			return
		}

		id := mux.Vars(r)["id"]
		data, err := s.db.Get(bucket, id)
		if err != nil {
			SendError(w, "failed to read entity: "+id+" from: "+string(bucket), err)
			return
		}

		t, err := ParseEntity(data, f)
		if err != nil {
			SendError(w, "failed to parse entity: "+id+" from: "+string(bucket), err)
			return
		}

		if t.UserID() != user.ID {
			http.Error(w, "not allowed", http.StatusUnauthorized)
			return
		}

		if err := s.db.Delete(bucket, id); err != nil {
			SendError(w, "failed to delete entity: "+id+" from: "+string(bucket), err)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
