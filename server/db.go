package main

import (
	"encoding/json"
	"errors"
	"log"

	"go.etcd.io/bbolt"
)

// BucketName describes a defined name of a bucket in the database.
type BucketName string

// Enumeration of the database buckets
const (
	AccountBucket  BucketName = "accounts"
	MaterialBucket BucketName = "materials"
	ProductBucket  BucketName = "products"
	ProcessBucket  BucketName = "processes"
	ScenarioBucket BucketName = "scenarios"
)

// DB provides the database methods of the application.
type DB struct {
	db *bbolt.DB
}

func OpenDB(path string) (*DB, error) {
	log.Println("open database:", path)
	db, err := bbolt.Open(path, 0600, nil)
	if err != nil {
		return nil, err
	}

	// initialize the data buckets
	buckets := []BucketName{
		AccountBucket,
		MaterialBucket,
		ProductBucket,
		ProcessBucket,
		ScenarioBucket,
	}
	err = db.Update(func(tx *bbolt.Tx) error {
		for _, bucket := range buckets {
			_, err := tx.CreateBucketIfNotExists([]byte(bucket))
			if err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &DB{db: db}, nil
}

// Close the database.
func (db *DB) Close() error {
	return db.db.Close()
}

// Put stores the given entity into the given bucket.
func (db *DB) Put(bucket BucketName, e Entity) error {
	if e == nil {
		return errors.New("db.put:: entity is nil")
	}
	value, err := json.Marshal(e)
	if err != nil {
		return err
	}
	return db.db.Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(bucket))
		return bucket.Put(e.Key(), value)
	})
}

// Get returns the data of the entity with the given ID from the given bucket.
func (db *DB) Get(bucket BucketName, id string) ([]byte, error) {
	var data []byte
	err := db.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(bucket))
		data = b.Get([]byte(id))
		return nil
	})
	return data, err
}

// Delete deletes the entity with the given ID from the bucket.
func (db *DB) Delete(bucket BucketName, id string) error {
	return db.db.Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(bucket))
		return bucket.Delete([]byte(id))
	})
}

// Load gets the data from the database (via Get) and unmarshals them.
func (db *DB) Load(bucket BucketName, id string, e interface{}) error {
	data, err := db.Get(bucket, id)
	if err != nil {
		return err
	}
	if data == nil {
		return errors.New("not found")
	}
	return json.Unmarshal(data, e)
}

// Each iterates over each entity in the given bucket and calls the given
// function.
func (db *DB) Each(bucket BucketName,
	fn func(key string, data []byte) error) error {
	return db.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(bucket))
		return b.ForEach(func(key, val []byte) error {
			return fn(string(key), val)
		})
	})
}

// EachWhile does the same as Each but only as long as the given function returns
// true.
func (db *DB) EachWhile(bucket BucketName,
	fn func(key string, data []byte) bool) error {
	return db.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(bucket))
		cursor := b.Cursor()
		for k, v := cursor.First(); k != nil; k, v = cursor.Next() {
			if !fn(string(k), v) {
				break
			}
		}
		return nil
	})
}
