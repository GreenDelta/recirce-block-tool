package main

// Entity is a thing that can be stored in the database. It just
// needs to provide a unique key for the storage and needs to
// be serializable as Json object.
type Entity interface {
	Key() []byte
}

type User struct {
	ID   string `json:"id"`
	Name string `json:"name"`

	// the password hash should be never sent to the client
	Hash    string `json:"hash,omitempty"`
	IsAdmin bool   `json:"isAdmin"`
}

func (u *User) Key() []byte {
	return []byte(u.ID)
}

type Material struct {
	ID     string `json:"id"`
	User   string `json:"user"`
	Name   string `json:"name"`
	Parent string `json:"parent"`
}

func (m *Material) Key() []byte {
	return []byte(m.ID)
}

type Component struct {
	ID         string         `json:"id"`
	Name       string         `json:"name"`
	Mass       float64        `json:"mass"`
	Components []Component    `json:"components,omitempty"`
	Materials  []MaterialPart `json:"materials,omitempty"`
}

type MaterialPart struct {
	ID        string         `json:"id"`
	Material  string         `json:"material"`
	Mass      float64        `json:"mass"`
	Materials []MaterialPart `json:"materials,omitempty"`
}

type Product struct {
	Component
	User string `json:"user,omitempty"`
}

func (p *Product) Key() []byte {
	return []byte(p.ID)
}
