package main

// Entity represents an object that can be stored in the database.
// It is required to provide a unique key for storage and to be serializable
// as a JSON object.
type Entity interface {
	Key() []byte
}

// UserEntity represents an entity that is associated with a specific user.
type UserEntity interface {
	Entity
	UserID() string
}

type BaseInfo struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (i *BaseInfo) Key() []byte {
	return []byte(i.ID)
}

type User struct {
	BaseInfo
	Hash    string `json:"hash,omitempty"`
	IsAdmin bool   `json:"isAdmin"`
}

type UserInfo struct {
	BaseInfo
	User string `json:"user,omitempty"`
}

func (i *UserInfo) UserID() string {
	return i.User
}

type Material struct {
	UserInfo
	Parent string `json:"parent"`
}

type ProductPart struct {
	Mass  float64     `json:"mass"`
	Parts []Component `json:"parts,omitempty"`
}

type Component struct {
	BaseInfo
	ProductPart
	IsMaterial bool `json:"isMaterial"`
}

type Product struct {
	UserInfo
	ProductPart
}

type Process struct {
	UserInfo
	EmissionFactor float64 `json:"emissionFactor"`
}

type Scenario struct {
	UserInfo
	Product Product        `json:"product,omitempty"`
	Steps   []ScenarioStep `json:"steps,omitempty"`
}

type ScenarioStep struct {
	ID        string         `json:"id"`
	Process   string         `json:"process,omitempty"`
	Fractions []Fraction     `json:"fractions,omitempty"`
	Steps     []ScenarioStep `json:"steps,omitempty"`
}

type Fraction struct {
	ID        string        `json:"id"`
	Component Component     `json:"component,omitempty"`
	State     FractionState `json:"state"`
	Value     float64       `json:"value"`
}

type FractionState string

const (
	PassThroughState FractionState = "Pass through"
	RecycledState    FractionState = "Recycled"
	DisposedState    FractionState = "Disposed"
)
