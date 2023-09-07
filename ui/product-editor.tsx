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
          <div>
            <input type="text"
              value={comp.name}
              onChange={e => {
                comp.name = e.target.value;
                props.onChanged();
              }} />
          </div>
          <div style={{ display: "inline-flex" }}>
            <input type="number" value={comp.mass}
              onChange={e => {
                const s = e.target.value;
                if (s) {
                  comp.mass = Number.parseFloat(s);
                }
                props.onChanged();
              }} />
            <label style={{ padding: 15 }}>kg</label>
          </div>
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
    const t = parentOf(props.component, props.product);
    if (!t) {
      return;
    }
    const [parent, idx] = t;
    if (parent.components && idx >= 0) {
      parent.components.splice(idx, 1);
      props.onChanged();
    }
  };

  const style = { cursor: "pointer", fontSize: "0.8em" };
  const links = [
    <li><a onClick={onAddComp} style={style}>Add component</a></li>,
    <li>|</li>,
    <li><a onClick={onAddMat} style={style}>Add material</a></li>,
  ];
  if (!props.isRoot) {
    links.push(<li>|</li>);
    links.push(
      <li><a onClick={onDelete} style={style}>Delete</a></li>
    );
  }

  return (
    <nav>
      <ul></ul>
      <ul>
        {links}
      </ul>
    </nav>
  );
};

function parentOf(comp: Component, root: Component): [Component, number] | null {
  if (!comp || !root || !root.components) {
    return null;
  }
  for (let i = 0; i < root.components.length; i++) {
    const child = root.components[i];
    if (child.id === comp.id) {
      return [root, i];
    }
    const sub = parentOf(comp, child);
    if (sub) {
      return sub;
    }
  }
  return null;
}
