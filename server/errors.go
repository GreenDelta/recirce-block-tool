package main

import "errors"

var ErrNoUser = errors.New("current user is not available")
var ErrNoData = errors.New("no data were sent")
