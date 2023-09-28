package main

import (
	"encoding/json"

	"github.com/rs/xid"
)

func ParseEntity[T Entity](data []byte, f func() T) (T, error) {
	t := f()
	if err := json.Unmarshal(data, t); err != nil {
		return t, err
	}
	return t, nil
}

func ReadUserEntities[T UserEntity](
	db *DB, bucket Bucket, user *User, f func() T,
) ([]T, error) {

	if user == nil {
		return nil, ErrNoUser
	}

	ts := make([]T, 0)
	err := db.Each(bucket, func(_ string, data []byte) error {
		t, err := ParseEntity[T](data, f)
		if err != nil {
			return err
		}
		if t.UserID() == user.ID {
			ts = append(ts, t)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return ts, nil
}

func WriteUserEntity(db *DB, bucket Bucket, user *User, e UserEntity) error {
	if user == nil {
		return ErrNoUser
	}
	if e == nil {
		return ErrNoData
	}
	e.SetUserID(user.ID)
	return db.Put(bucket, e)
}

func (db *DB) GetMaterials(user *User) ([]*Material, error) {
	return ReadUserEntities(db, MaterialBucket, user, MaterialFn)
}

func (db *DB) PutMaterial(user *User, material *Material) error {
	return WriteUserEntity(db, MaterialBucket, user, material)
}

func (db *DB) FindMaterial(user *User, name string) (*Material, error) {
	if user == nil {
		return nil, ErrNoUser
	}
	matId := LowerTrim(name)
	var material *Material
	err := db.EachWhile(MaterialBucket, func(key string, data []byte) bool {
		m, err := ParseEntity(data, MaterialFn)
		if err != nil || m.User != user.ID {
			return true
		}
		if matId == LowerTrim(m.Name) {
			material = m
			return false
		}
		return true
	})
	if err != nil {
		return nil, err
	}
	return material, err
}

func (db *DB) CreateMaterial(user *User, name, parent string) (*Material, error) {
	if user == nil {
		return nil, ErrNoUser
	}
	material := &Material{}
	material.ID = xid.New().String()
	material.User = user.ID
	material.Name = name
	material.Parent = parent

	if err := db.PutMaterial(user, material); err != nil {
		return nil, err
	}
	return material, nil
}

func (db *DB) GetProducts(user *User) ([]*Product, error) {
	return ReadUserEntities(db, ProductBucket, user, ProductFn)
}

func (db *DB) PutProduct(user *User, product *Product) error {
	if user == nil {
		return ErrNoUser
	}
	if product == nil {
		return ErrNoData
	}

	// most of the code below is just for creating materials that do not
	// exist yet

	materials, err := db.GetMaterials(user)
	if err != nil {
		return err
	}
	matIdx := make(map[string]*Material)
	for i := range materials {
		m := materials[i]
		matIdx[LowerTrim(m.Name)] = m
	}

	sync := func(material, parent string) error {
		key := LowerTrim(material)
		if key == "" {
			return nil
		}
		if _, ok := matIdx[key]; ok {
			return nil
		}
		if mat, err := db.CreateMaterial(user, material, parent); err != nil {
			return err
		} else {
			matIdx[key] = mat
			return nil
		}
	}

	var visit func(root *Component) error
	visit = func(parent *Component) (err error) {
		for i := range parent.Parts {
			child := &parent.Parts[i]
			if child.IsMaterial {
				if parent.IsMaterial {
					err = sync(child.Name, parent.Name)
				} else {
					err = sync(child.Name, "")
				}
			}
			if err == nil {
				err = visit(child)
			}
			if err != nil {
				return err
			}
		}
		return nil
	}

	for i := range product.Parts {
		comp := &product.Parts[i]
		if err := visit(comp); err != nil {
			return err
		}
	}

	return WriteUserEntity(db, ProductBucket, user, product)
}
