package main

import (
	"strings"
)

// LowerTrim converts the given string to lower case and removes leading and
// trailing whitespaces.
func LowerTrim(s string) string {
	return strings.ToLower(strings.TrimSpace(s))
}

// Trim removes leading and trailing whitespaces from the given string.
func Trim(s string) string {
	return strings.TrimSpace(s)
}

func IsEq(a, b string) bool {
	return LowerTrim(a) == LowerTrim(b)
}
