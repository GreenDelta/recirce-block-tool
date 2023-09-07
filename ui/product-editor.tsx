import * as React from "react";
import { Link } from "react-router-dom";
import { MainMenu } from "./menu";
import { Component, Product } from "./model";
import * as uuid from "uuid";

export const ProductEditor = () => {
  const [product, setProduct] = React.useState<Product>({
    id: uuid.v4(),
    name: "New product",
    mass: 1.0,
  });

  return <>
    <MainMenu />
    <nav aria-label="breadcrumb">
      <ul>
        <li><Link to="/ui/products">Products</Link></li>
        <li><Link to="/ui/products/create">New product</Link></li>
      </ul>
    </nav>

    <p>
      Please define the product composition below.
    </p>
    <ComponentPanel
      isRoot={true}
      component={product}
      onChanged={() => setProduct({ ...product })} />
  </>;

}

const ComponentPanel = ({ isRoot, component, onChanged }: {
  isRoot: boolean,
  component: Component,
  onChanged: () => void,
}) => {

  const subComps = [];
  if (component.components) {
    for (const c of component.components) {
      subComps.push(
        <ComponentPanel
          isRoot={false}
          component={c}
          onChanged={onChanged} />);
    }
  }

  const onAdd = () => {
    const sub = {
      id: uuid.v4(),
      name: "New component",
      mass: 1.0,
    };
    if (component.components) {
      component.components.push(sub);
    } else {
      component.components = [sub];
    }
    onChanged();
  };

  return <>
    <article style={{ margin: "3px", paddingBottom: "15px" }}>
      <header style={{ padding: "15px", marginBottom: "15px" }}>
        <div className="grid">
          <label>
            {isRoot ? "Product" : "Component"}
            <input type="text" value={component.name} />
          </label>
          <label>
            Mass [kg]
            <input type="number" value={component.mass} />
          </label>
        </div>
      </header>
      {subComps}
      <a onClick={() => onAdd()} style={{ cursor: "pointer" }}>+ Add a component</a>
    </article>
  </>;
}
