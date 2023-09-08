package main

import (
	"encoding/csv"
	"log"
	"os"
	"path/filepath"

	"github.com/gorilla/securecookie"
	"github.com/gorilla/sessions"
	"github.com/rs/xid"
)

type DataDir struct {
	dir     string
	db      *DB
	cookies *sessions.CookieStore
}

func InitDataDir(dir string) (*DataDir, error) {
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return nil, err
	}

	dbPath := filepath.Join(dir, "database")
	var dbExists bool
	_, err := os.Stat(dbPath)
	if err == nil {
		dbExists = true
	} else if os.IsNotExist(err) {
		dbExists = false
	} else {
		return nil, err
	}

	db, err := OpenDB(dbPath)
	if err != nil {
		return nil, err
	}

	data := &DataDir{
		dir: dir,
		db:  db,
	}
	if !dbExists {
		if err := data.initDatabase(); err != nil {
			return nil, err
		}
	}
	if err := data.initCookieStore(); err != nil {
		return nil, err
	}
	return data, nil
}

func (dir *DataDir) initDatabase() error {
	log.Println("create fresh database")
	db := dir.db

	// create an admin
	account := &User{
		Email:   "@admin",
		Name:    "Admin",
		IsAdmin: true,
	}
	account.ID = xid.New().String()
	hash, err := hashPassword("admin")
	if err != nil {
		return err
	}
	account.Hash = hash
	if err := db.Put(AccountBucket, account); err != nil {
		return err
	}
	log.Println("WARNING: created default admin; " +
		"you should set another password")

	dir.insertMaterials()

	return nil
}

func (dir *DataDir) insertMaterials() {
	path := filepath.Join(dir.dir, "materials.csv")
	file, err := os.Open(path)
	if err != nil {
		log.Println("failed to read default materials:", err)
		return
	}
	defer file.Close()
	rows, err := csv.NewReader(file).ReadAll()
	if err != nil {
		log.Println("failed to read default materials:", err)
		return
	}
	log.Println("insert materials from", path)
	for _, row := range rows {
		mat := &Material{
			Name:   row[0],
			Parent: row[1],
		}
		if err := dir.db.Put(MaterialBucket, mat); err != nil {
			log.Println("failed to insert material:", err)
			return
		}
	}
}

func (dir *DataDir) initCookieStore() error {
	log.Println("create cookie store")
	keyPath := filepath.Join(dir.dir, "cookies.key")

	_, err := os.Stat(keyPath)
	if err != nil && !os.IsNotExist(err) {
		return err
	}
	var key []byte
	if os.IsNotExist(err) {
		key = securecookie.GenerateRandomKey(32)
		err = os.WriteFile(keyPath, key, os.ModePerm)
		if err != nil {
			return err
		}
	} else {
		key, err = os.ReadFile(keyPath)
		if err != nil {
			return err
		}
	}
	dir.cookies = sessions.NewCookieStore(key)
	return nil
}
