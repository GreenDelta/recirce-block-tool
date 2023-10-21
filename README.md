# ReCircE - Block Tool

The ReCircE Block-Tool calculates recycling rates and CO2 footprints of waste treatment scenarios of complex products.

__TODO__:

* use combo for process selection in combos
* store treatments
* edit processes
* delete material
* calculation

https://www.nature.com/articles/s41597-020-0573-9/tables/4

Build the UI:

```bash
npm install
npx webpack [watch]
```

Build the server:

```bash
cd server
go build
./recircle -data ../data -static ../static
```

## Linting

https://typescript-eslint.io/getting-started
