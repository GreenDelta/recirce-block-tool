package main

import (
	"encoding/json"

	"github.com/rs/xid"
)

func ReadMaterial(data []byte) (*Material, error) {
	var material Material
	if err := json.Unmarshal(data, &material); err != nil {
		return nil, err
	}
	return &material, nil
}

func (db *DB) GetMaterials(user *User) ([]*Material, error) {
	if user == nil {
		return nil, ErrNoUser
	}
	var materials []*Material
	err := db.Each(MaterialBucket, func(key string, data []byte) error {
		m, err := ReadMaterial(data)
		if err != nil {
			return err
		}
		if m.User == user.ID {
			materials = append(materials, m)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return materials, nil
}

func (db *DB) FindMaterial(user *User, name string) (*Material, error) {
	if user == nil {
		return nil, ErrNoUser
	}
	matId := LowerTrim(name)
	var material *Material
	err := db.EachWhile(MaterialBucket, func(key string, data []byte) bool {
		m, err := ReadMaterial(data)
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

func (db *DB) PutMaterial(user *User, material *Material) error {
	if user == nil {
		return ErrNoUser
	}
	if material == nil {
		return ErrNoData
	}
	material.User = user.ID
	return db.Put(MaterialBucket, material)
}

func (db *DB) CreateMaterial(user *User, name, parent string) (*Material, error) {
	if user == nil {
		return nil, ErrNoUser
	}
	material := &Material{
		ID:     xid.New().String(),
		User:   user.ID,
		Name:   name,
		Parent: parent,
	}
	if err := db.PutMaterial(user, material); err != nil {
		return nil, err
	}
	return material, nil
}

func ReadProduct(data []byte) (*Product, error) {
	var product Product
	if err := json.Unmarshal(data, &product); err != nil {
		return nil, err
	}
	return &product, nil
}

func (db *DB) GetProducts(user *User) ([]*Product, error) {
	if user == nil {
		return nil, ErrNoUser
	}
	var products []*Product
	err := db.Each(ProductBucket, func(key string, data []byte) error {
		var p Product
		if err := json.Unmarshal(data, &p); err != nil {
			return err
		}
		if p.User == user.ID {
			products = append(products, &p)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return products, nil
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

	syncMat := func(material, parent string) error {
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

	var visitMats func(materials []MaterialPart, parent *MaterialPart) error
	visitMats = func(materials []MaterialPart, parent *MaterialPart) error {
		for i := range materials {
			mat := &materials[i]
			par := ""
			if parent != nil {
				par = parent.Material
			}
			if err := syncMat(mat.Material, par); err != nil {
				return err
			}
			if err := visitMats(mat.Materials, mat); err != nil {
				return err
			}
		}
		return nil
	}

	var visitComps func(comps []Component) error
	visitComps = func(comps []Component) error {
		for i := range comps {
			comp := &comps[i]
			if err := visitMats(comp.Materials, nil); err != nil {
				return err
			}
			if err := visitComps(comp.Components); err != nil {
				return err
			}
		}
		return nil
	}

	if err := visitComps(product.Components); err != nil {
		return err
	}
	if err := visitMats(product.Materials, nil); err != nil {
		return err
	}

	product.User = user.ID
	if err := db.Put(ProductBucket, product); err != nil {
		return err
	}
	return nil
}
