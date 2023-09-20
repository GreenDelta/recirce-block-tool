# ReCircE - Block Tool

__TODO__:

* store processes
* edit processes
* define process steps
* delete material
* uploading a product should sync materials (creating them if they do not exist)
* create a waste treatment tree
* create templates for treatment steps
* calculate

https://www.nature.com/articles/s41597-020-0573-9/tables/4

Build the UI:

```
npm install
npx webpack [watch]
```

Build the server:

```
cd server
go build
./recircle -data ../data -static ../static
```

## Linting

https://typescript-eslint.io/getting-started
