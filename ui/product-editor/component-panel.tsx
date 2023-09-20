import React from "react";
import { Component, Product, ProductPart } from "../model";
import * as uuid from "uuid";
import { MaterialList, PanelLink, numOf } from "./util";

interface Props {
  isRoot?: boolean;
  component: Component;
  product: Product;
  materials: string[];
  onChanged: () => void;
  onSave: () => void;
}

export const ComponentPanel = (props: Props) => {
  const comp = props.component;

  const subComps = [];
  if (comp.components) {
    for (const c of comp.components) {
      const subProps = { ...props, component: c, isRoot: false };
      subComps.push(<ComponentPanel key={c.id} {...subProps} />);
    }
  }

  return (
    <>
      <article style={{ margin: "3px", paddingBottom: "15px" }}>
        <header style={{ padding: "15px", marginBottom: "15px" }}>
          <div className="grid">
            <div>
              <input
                type="text"
                value={comp.name}
                onChange={(e) => {
                  comp.name = e.target.value;
                  props.onChanged();
                }}
              />
            </div>
            <div style={{ display: "inline-flex" }}>
              <input
                type="number"
                value={comp.mass}
                onChange={(e) => numOf(e, num => {
                  comp.mass = num;
                  props.onChanged();
                })}
              />
              <label style={{ padding: 15 }}>g</label>
            </div>
          </div>
        </header>
        <Menu {...props} />
        {subComps}
        <MaterialList part={comp} {...props} />
      </article>
    </>
  );
};

const Menu = (props: Props) => {
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
    const mat = {
      id: uuid.v4(),
      material: "",
      mass: 1.0,
    };
    const c = props.component;
    if (c.materials) {
      c.materials.push(mat);
    } else {
      c.materials = [mat];
    }
    props.onChanged();
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

  const links = [
    <PanelLink onClick={onAddComp} label="Add component" sep />,
    <PanelLink onClick={onAddMat} label="Add material" sep={!props.isRoot} />,
  ];
  if (!props.isRoot) {
    links.push(<PanelLink onClick={onDelete} label="Delete component" />);
  }

  const massFraction = props.isRoot ? (
    <></>
  ) : (
    massFractionOf(props.component, props.product)
  );

  return (
    <nav>
      <ul>{massFraction}</ul>
      <ul>{links}</ul>
    </nav>
  );
};

function massFractionOf(elem: ProductPart, product: Product) {
  const style: React.CSSProperties = { fontSize: "0.8em" };
  let share;
  if (product.mass <= 0 || elem.mass < 0) {
    style.color = "red";
    share = "NaN";
  } else {
    const val = (100 * elem.mass) / product.mass;
    share = val.toFixed(2);
    if (val > 100) {
      style.color = "red";
    }
  }
  return (
    <li>
      Mass fraction: <span style={style}>{share}</span>
    </li>
  );
}

function parentOf(
  comp: Component,
  root: Component
): [Component, number] | null {
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
