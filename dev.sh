#!/bin/bash

cd server
go build
./recirce -data ../data -static ../static
