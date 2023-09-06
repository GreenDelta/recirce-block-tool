import * as React from "react";
import { Link } from "react-router-dom";
import { MainMenu } from "./ui/menu";
import { Component, Product } from "./ui/model";

export const ProductsOverview = () => {

  return <>
    <MainMenu />
    <nav aria-label="breadcrumb">
      <ul>
        <li><Link to="/products">Products</Link></li>
      </ul>
    </nav>
    <p>
      There are currently no products available. You can{" "}
      <Link to="/products/create">create</Link> a new product or{" "}
      <Link to="/products/upload">upload</Link> a digital product
      pass.
    </p>
  </>;

};

export const ProductEditor = () => {
  const [product, setProduct] = React.useState<Product>({
    id: "abc",
    name: "New product",
    mass: 1,
    components: [],
    materials: [],
  });

  return <>
    <MainMenu />
    <nav aria-label="breadcrumb">
      <ul>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/products/create">New product</Link></li>
      </ul>
    </nav>

    <p>
      Please define the product composition below.
    </p>

    <ComponentPanel component={product} onChanged={() => setProduct({...product})} />

  </>;

}

const ComponentPanel = ({ component, onChanged }: {
  component: Component,
  onChanged: () => void
}) => {

  const subs = component.components.map(
    c => <ComponentPanel component={c} onChanged={onChanged} />);

  const onAdd = () => {
    component.components.push({
      name: "New component",
      mass: 1,
      components: [],
      materials: [],
    });
    onChanged();
  };

  return <>
    <article style={{margin: "3px", paddingBottom: "15px"}}>
      <header style={{ padding: "15px", marginBottom: "15px"}}>
        <div className="grid">
          <label>
            Product
            <input type="text" value={component.name}/>
          </label>
          <label>
            Mass [kg]
            <input type="number" value={component.mass}/>
          </label>
        </div>
      </header>
      {subs}
      <a onClick={() => onAdd()} style={{cursor: "pointer"}}>+ Add a component</a>
    </article>
  </>;
}
