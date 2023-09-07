package main

import (
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"
	"strings"

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

// Checks if the given email can be registered for a user. When this is not the
// case, the corresponding error is written to the response and false is returned.
func canRegisterEmail(w http.ResponseWriter, s *Server, email string) bool {
	if len(email) < 4 || !strings.Contains(email, "@") {
		http.Error(w, "invalid email", http.StatusBadRequest)
		return false
	}
	if user := findUser(s.db, email); user != nil {
		http.Error(w, "email in use", http.StatusBadRequest)
		return false
	}
	return true
}

func findUser(db *DB, email string) *User {
	var user *User
	err := db.EachWhile(AccountBucket, func(key string, value []byte) bool {
		var u User
		err := json.Unmarshal(value, &u)
		if err != nil {
			log.Println("error: failed to unmarshal user:", err)
			return true
		}
		if u.Email == email {
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

func (s *Server) getSessionUser(r *http.Request) *User {
	session, err := s.cookies.Get(r, "easyepd-session")
	if err != nil {
		log.Println("ERROR: failed to read session cookie", err)
		return nil
	}
	id, ok := session.Values["user"].(string)
	if !ok || id == "" {
		return nil
	}
	var user User
	err = s.db.Load(AccountBucket, id, &user)
	if err != nil {
		log.Println("ERROR: failed to load user ", id, "from database", err)
		return nil
	}
	return &user
}

func (s *Server) handleSignUp() http.HandlerFunc {

	type request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	return func(w http.ResponseWriter, r *http.Request) {

		if existing := s.getSessionUser(r); existing != nil {
			http.Error(w, "you are already logged in", http.StatusBadRequest)
			return
		}

		var req request
		if err := DecodeJSON(w, r, &req); err != nil {
			return
		}

		email := LowerTrim(req.Email)
		password := Trim(req.Password)
		if !isValidPassword(w, password) || !canRegisterEmail(w, s, email) {
			return
		}

		hash, err := hashPassword(password)
		if err != nil {
			http.Error(w, "server error", http.StatusInternalServerError)
			log.Println("ERROR: could not generate password hash", err)
			return
		}

		user := &User{
			Email: email,
			Hash:  hash,
		}
		user.ID = nextId()
		if err = s.db.Put(AccountBucket, user); err != nil {
			http.Error(w, "server error", http.StatusInternalServerError)
			return
		}

		session, err := s.cookies.Get(r, "easyepd-session")
		if err != nil {
			// just logging the error for now
			log.Println("WARNING: invalid cookie", err)
		} else {
			session.Values["user"] = user.ID
			session.Save(r, w)
		}

		user.Hash = ""
		ServeJSON(user, w)
	}
}

func (s *Server) handleLogin() http.HandlerFunc {

	type request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	return func(w http.ResponseWriter, r *http.Request) {

		var credentials request
		if err := DecodeJSON(w, r, &credentials); err != nil {
			http.Error(w, "invalid login data", http.StatusBadRequest)
			return
		}

		user := findUser(s.db, LowerTrim(credentials.Email))
		if user == nil {
			http.Error(w, "invalid login data", http.StatusUnauthorized)
			return
		}

		// check the password hash
		hash, err := base64.StdEncoding.DecodeString(user.Hash)
		if err != nil {
			http.Error(w, "could not process login data", http.StatusInternalServerError)
			return
		}
		err = bcrypt.CompareHashAndPassword(hash, []byte(Trim(credentials.Password)))
		if err != nil {
			http.Error(w, "invalid login data", http.StatusUnauthorized)
			return
		}

		session, _ := s.cookies.Get(r, "easyepd-session")
		session.Values["user"] = user.ID
		session.Save(r, w)

		user.Hash = ""
		ServeJSON(user, w)
	}
}

func (s *Server) handleLogout() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		session, _ := s.cookies.Get(r, "easyepd-session")
		session.Values["user"] = ""
		session.Save(r, w)
	}
}

func (s *Server) handleGetCurrentUser() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		user := s.getSessionUser(r)
		if user == nil {
			http.Error(w, "not logged in", http.StatusUnauthorized)
			return
		}
		user.Hash = ""
		ServeJSON(user, w)
	}
}

func (s *Server) handleGetUsers() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		account := s.getSessionUser(r)
		if account == nil {
			http.Error(w, "Not logged in", http.StatusUnauthorized)
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
			log.Println("ERROR: failed to get users", err)
			http.Error(w, "failed to get users", http.StatusInternalServerError)
			return
		}

		ServeJSON(users, w)
	}
}

func (s *Server) handleGetUser() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		account := s.getSessionUser(r)
		if account == nil {
			http.Error(w, "Not logged in", http.StatusUnauthorized)
			return
		}

		id := mux.Vars(r)["id"]
		var user User
		if err := s.db.Load(AccountBucket, id, &user); err != nil {
			http.NotFound(w, r)
			return
		}
		user.Hash = ""
		ServeJSON(&user, w)
	}
}

func (s *Server) handlePostUser() http.HandlerFunc {

	type request struct {
		User
		// when a new user is posted (by an admin), also an
		// initial password has to be provided
		Password string `json:"password"`
	}

	return func(w http.ResponseWriter, r *http.Request) {

		account := s.getSessionUser(r)
		if account == nil {
			http.Error(w, "not logged in", http.StatusUnauthorized)
			return
		}

		var req request
		if err := DecodeJSON(w, r, &req); err != nil {
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

			email := LowerTrim(req.Email)
			if email != user.Email {
				if !canRegisterEmail(w, s, email) {
					return
				}
			}

			// check whether there is a password change
			if req.Password != "" {
				password := Trim(req.Password)
				if !isValidPassword(w, password) {
					return
				}
				hash, err := hashPassword(Trim(req.Password))
				if err != nil {
					logErr(w, "failed to hash password", err)
					return
				}
				user.Hash = hash
			}

			user.Name = req.Name
			user.Email = req.Email
			user.Telephone = req.Telephone
			// make sure to not un-admin an admin
			if user.ID != account.ID {
				user.IsAdmin = req.IsAdmin
			}
			if err := s.db.Put(AccountBucket, &user); err != nil {
				logErr(w, "failed to save user", err)
				return
			}
			user.Hash = ""
			ServeJSON(&user, w)
			return
		}

		// create a new user
		email := LowerTrim(req.Email)
		password := Trim(req.Password)
		if !isValidPassword(w, password) || !canRegisterEmail(w, s, email) {
			return
		}

		hash, err := hashPassword(password)
		if err != nil {
			logErr(w, "could not generate password hash", err)
			return
		}

		user := &User{
			Email:     email,
			Hash:      hash,
			Name:      req.Name,
			Telephone: req.Telephone,
			IsAdmin:   req.IsAdmin,
		}
		user.ID = xid.New().String()
		if err := s.db.Put(AccountBucket, user); err != nil {
			logErr(w, "failed to save user", err)
			return
		}
		user.Hash = ""
		ServeJSON(&user, w)
	}
}
