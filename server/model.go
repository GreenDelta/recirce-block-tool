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
	SetUserID(string)
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

func (i *UserInfo) SetUserID(id string) {
	i.User = id
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
	DisposedState      FractionState = "Disposed"
	PassedThroughState FractionState = "Passed through"
	RecycledState      FractionState = "Recycled"
	ReusedState        FractionState = "Reused"
)

type Analysis struct {
	UserInfo
	Baseline  string     `json:"baseline,omitempty"`
	Scenarios []Scenario `json:"scenarios,omitempty"`
}

type Result struct {
	Analysis        *Analysis        `json:"analysis"`
	WasteResults    []WasteResult    `json:"wasteResults"`
	EmissionResults []EmissionResult `json:"emissionResults"`
}

type WasteResult struct {
	Scenario       string  `json:"scenario"`
	AmountDisposed float64 `json:"amountDisposed"`
	AmountRecycled float64 `json:"amountRecycled"`
	AmountReused   float64 `json:"amountReused"`
}

type EmissionResult struct {
	Scenario string  `json:"scenario"`
	Value    float64 `json:"value"`
}

func MaterialFn() *Material {
	return &Material{}
}

func ProductFn() *Product {
	return &Product{}
}

func ScenarioFn() *Scenario {
	return &Scenario{}
}

func ProcessFn() *Process {
	return &Process{}
}

func AnalysisFn() *Analysis {
	return &Analysis{}
}
