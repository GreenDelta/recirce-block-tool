package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"runtime"
	"testing"
)

func readExample(file string) (*Product, error) {
	data, err := os.ReadFile(file)
	if err != nil {
		return nil, err
	}
	var product Product
	if err := json.Unmarshal(data, &product); err != nil {
		return nil, err
	}
	return &product, nil
}

func TestReadProductJSON(t *testing.T) {
	_, filename, _, _ := runtime.Caller(0)
	dir := filepath.Dir(filename)
	testFile := filepath.Join(dir, "model_test.json")
	product, err := readExample(testFile)
	if err != nil {
		t.Fatalf("failed reading file: %s", err)
	}
	if product.Name != "Example product" {
		t.Fatal("unexpected product name")
	}
}
