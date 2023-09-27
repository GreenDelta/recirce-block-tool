package main

import (
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/xid"
	"golang.org/x/crypto/bcrypt"
)

func hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password),
		bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(hash), nil
}

func isValidPassword(w http.ResponseWriter, password string) bool {
	if len(password) < 4 {
		http.Error(w, "invalid password", http.StatusBadRequest)
		return false
	}
	return true
}

func findUser(db *DB, name string) *User {
	key := LowerTrim(name)
	var user *User
	err := db.EachWhile(AccountBucket, func(_ string, value []byte) bool {
		var u User
		err := json.Unmarshal(value, &u)
		if err != nil {
			log.Println("error: failed to unmarshal user:", err)
			return true
		}
		if LowerTrim(u.Name) == key {
			user = &u
			return false
		}
		return true
	})
	if err != nil {
		log.Println("error: failed to get user from DB:", err)
		return nil
	}
	return user
}

func (s *Server) getSessionUser(w http.ResponseWriter, r *http.Request) *User {
	ses := s.Session(r)
	if ses == nil {
		http.Error(w, "Not logged in", http.StatusUnauthorized)
		return nil
	}
	id, ok := ses.Values["user"].(string)
	if !ok || id == "" {
		http.Error(w, "Not logged in", http.StatusUnauthorized)
		return nil
	}
	var user User
	if err := s.db.Load(AccountBucket, id, &user); err != nil {
		SendError(w, "failed to load user", err)
		return nil
	}
	return &user
}

func (s *Server) PostLogin() http.HandlerFunc {

	type request struct {
		User     string `json:"user"`
		Password string `json:"password"`
	}

	return func(w http.ResponseWriter, r *http.Request) {

		var credentials request
		if !ReadAsJson(w, r, &credentials) {
			http.Error(w, "invalid login data", http.StatusBadRequest)
			return
		}

		user := findUser(s.db, credentials.User)
		if user == nil {
			http.Error(w, "invalid login data", http.StatusUnauthorized)
			return
		}

		// check the password hash
		hash, err := base64.StdEncoding.DecodeString(user.Hash)
		if err != nil {
			SendError(w, "could not process login data", err)
			return
		}
		err = bcrypt.CompareHashAndPassword(hash, []byte(Trim(credentials.Password)))
		if err != nil {
			http.Error(w, "invalid login data", http.StatusUnauthorized)
			return
		}
		ses := s.Session(r)
		if ses == nil {
			SendError(w, "failed to create session", nil)
			return
		}

		ses.Values["user"] = user.ID
		ses.Save(r, w)
		user.Hash = ""
		SendAsJson(w, user)
	}
}

func (s *Server) PostLogout() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ses := s.Session(r)
		if ses == nil {
			return
		}
		// clear session data
		ses.Values = make(map[any]any)
		// expire the cookie
		ses.Options.MaxAge = -1
		if err := ses.Save(r, w); err != nil {
			SendError(w, "failed to logout", err)
			return
		}
		http.Redirect(w, r, "/", http.StatusSeeOther)
	}
}

func (s *Server) GetCurrentUser() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		user := s.getSessionUser(w, r)
		if user == nil {
			return
		}
		user.Hash = ""
		SendAsJson(w, user)
	}
}

func (s *Server) GetUsers() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		account := s.getSessionUser(w, r)
		if account == nil {
			return
		}
		if !account.IsAdmin {
			http.Error(w, "Not allowed", http.StatusUnauthorized)
			return
		}

		var users []*User
		err := s.db.Each(AccountBucket, func(key string, data []byte) error {
			var u User
			if err := json.Unmarshal(data, &u); err != nil {
				return err
			}
			u.Hash = ""
			users = append(users, &u)
			return nil
		})

		if err != nil {
			SendError(w, "failed to get users", err)
			return
		}

		SendAsJson(w, users)
	}
}

func (s *Server) GetUser() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		account := s.getSessionUser(w, r)
		if account == nil {
			return
		}
		id := mux.Vars(r)["id"]
		if id != account.ID && !account.IsAdmin {
			http.Error(w, "Not allowed", http.StatusUnauthorized)
		}

		var user User
		if err := s.db.Load(AccountBucket, id, &user); err != nil {
			http.NotFound(w, r)
			return
		}
		user.Hash = ""
		SendAsJson(w, &user)
	}
}

func (s *Server) PostUser() http.HandlerFunc {

	type request struct {
		User
		// when a new user is posted (by an admin), also an
		// initial password has to be provided
		Password string `json:"password"`
	}

	return func(w http.ResponseWriter, r *http.Request) {

		account := s.getSessionUser(w, r)
		if account == nil {
			return
		}

		var req request
		if !ReadAsJson(w, r, &req) {
			return
		}

		if req.IsAdmin && !account.IsAdmin {
			// non-admins cannot create admins
			http.Error(w, "not allowed", http.StatusUnauthorized)
			return
		}

		if req.ID != "" {
			if account.ID != req.ID && !account.IsAdmin {
				http.Error(w, "cannot update this user", http.StatusUnauthorized)
				return
			}

			// update an existing user by the user itself or an admin
			var user User
			if err := s.db.Load(AccountBucket, req.ID, &user); err != nil {
				http.NotFound(w, r)
				return
			}

			// check whether there is a password change
			if req.Password != "" {
				password := Trim(req.Password)
				if !isValidPassword(w, password) {
					return
				}
				hash, err := hashPassword(Trim(req.Password))
				if err != nil {
					SendError(w, "failed to hash password", err)
					return
				}
				user.Hash = hash
			}

			user.Name = req.Name
			// make sure to not un-admin an admin
			if user.ID != account.ID {
				user.IsAdmin = req.IsAdmin
			}
			if err := s.db.Put(AccountBucket, &user); err != nil {
				SendError(w, "failed to save user", err)
				return
			}
			user.Hash = ""
			SendAsJson(w, &user)
			return
		}

		// create a new user
		password := Trim(req.Password)
		if !isValidPassword(w, password) {
			return
		}
		existing := findUser(s.db, req.Name)
		if existing != nil {
			SendBadRequest(w, "a user with this name already exists")
			return
		}

		hash, err := hashPassword(password)
		if err != nil {
			SendError(w, "failed to create user", err)
			return
		}

		user := &User{
			Hash:    hash,
			Name:    req.Name,
			IsAdmin: req.IsAdmin,
		}
		user.ID = xid.New().String()
		if err := s.db.Put(AccountBucket, user); err != nil {
			SendError(w, "failed to save user", err)
			return
		}
		user.Hash = ""
		SendAsJson(w, &user)
	}
}
