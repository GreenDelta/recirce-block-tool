package main

// Entity is a thing that can be stored in the database.
type Entity interface {
	Key() []byte
}

// BaseEntity is a thing that is stored in the database. It should at least have
// an ID.
type BaseEntity struct {
	ID string `json:"id"`
}

// Key returns the database key of the given entity. Thus, every struct that
// embedds BaseEntity has the function to get a database key.
func (e *BaseEntity) Key() []byte {
	return []byte(e.ID)
}

type User struct {
	BaseEntity
	Name      string `json:"name"`
	Email     string `json:"email,omitempty"`
	Telephone string `json:"telephone,omitempty"`

	// the password hash should be never sent to the client
	Hash    string `json:"hash,omitempty"`
	IsAdmin bool   `json:"isAdmin"`
}

type Product struct {
	BaseEntity
}
