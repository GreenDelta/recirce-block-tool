import * as React from "react";
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
    <p>
      <strong>Create a new product</strong>
    </p>
    <ComponentPanel
      key={product.id}
      isRoot
      product={product}
      component={product}
      onChanged={() => setProduct({ ...product })} />
  </>;
}

interface CompProps {
  isRoot?: boolean;
  component: Component;
  product: Product;
  onChanged: () => void;
}

const ComponentPanel = (props: CompProps) => {
  const comp = props.component;

  const subComps = [];
  if (comp.components) {
    for (const c of comp.components) {
      const subProps = { ...props, component: c, isRoot: false };
      subComps.push(<ComponentPanel key={c.id} {...subProps} />);
    }
  }

  return <>
    <article style={{ margin: "3px", paddingBottom: "15px" }}>
      <header style={{ padding: "15px", marginBottom: "15px" }}>
        <div className="grid">
          <label>
            {props.isRoot ? "Product" : "Component"}
            <input type="text"
              value={comp.name}
              onChange={e => {
                comp.name = e.target.value;
                props.onChanged();
              }} />
          </label>
          <label>
            Mass [kg]
            <input type="number" value={comp.mass}
              onChange={e => {
                const s = e.target.value;
                if (s) {
                  comp.mass = Number.parseFloat(s);
                }
                props.onChanged();
              }} />
          </label>
        </div>
      </header>
      <CompMenu {...props} />
      {subComps}
    </article>
  </>;
}

const CompMenu = (props: CompProps) => {

  const onAddComp = () => {
    const sub = {
      id: uuid.v4(),
      name: "New component",
      mass: 1.0,
    };
    const c = props.component;
    if (c.components) {
      c.components.push(sub);
    } else {
      c.components = [sub];
    }
    props.onChanged();
  };

  const onAddMat = () => {

  };

  const onDelete = () => {

  }

  const style = { cursor: "pointer" };
  const links = [
    <li><a onClick={onAddComp} style={style}>Add a component</a></li>,
    <li><a onClick={onAddMat} style={style}>Add a material</a></li>,
  ];
  if (!props.isRoot) {
    links.push(
      <li><a onClick={onDelete} style={style}>Delete this component</a></li>
    )
  }

  return (
    <nav aria-label="breadcrumb">
      <ul>
        {links}
      </ul>
    </nav>
  );
};
