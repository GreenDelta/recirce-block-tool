import React, { useState } from "react";
import { Component, Product, ProductPart } from "../model";
import * as uuid from "uuid";
import { MaterialList, numOf } from "./util";

import { AddComponentIcon, AddIcon, DeleteIcon, ExpandLessIcon, ExpandMoreIcon } from "../icons";

interface Props {
  isRoot?: boolean;
  component: Component;
  product: Product;
  materials: string[];
  onChanged: () => void;
}

export const ComponentPanel = (props: Props) => {

  const [collapsed, setCollapsed] = useState(false);

  const comp = props.component;
  const subComps = [];
  if (comp.components) {
    for (const c of comp.components) {
      const subProps = { ...props, component: c, isRoot: false };
      subComps.push(<ComponentPanel key={c.id} {...subProps} />);
    }
  }

  const icon = collapsed
    ? <ExpandLessIcon tooltip="Collapse" onClick={() => setCollapsed(false)} />
    : <ExpandMoreIcon tooltip="Expand" onClick={() => setCollapsed(true)} />;

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

  const content = collapsed
    ? <></>
    : <article className="re-panel">
      <Menu {...props} />
      {subComps}
      <MaterialList part={comp} {...props} />
    </article>

  return (
    <>
      <article className="re-panel">
        <div className="grid">
          <div className="re-flex-div">
            <label>
              {icon}
            </label>
            <input type="text" className="re-panel-input"
              value={comp.name}
              onChange={(e) => {
                comp.name = e.target.value;
                props.onChanged();
              }}
            />
          </div>
          <div className="re-flex-div">
            <input type="number" className="re-panel-input"
              value={comp.mass}
              onChange={(e) => numOf(e, num => {
                comp.mass = num;
                props.onChanged();
              })}
            />
            <label>g</label>
            {!props.isRoot &&
              <label>
                <DeleteIcon tooltip="Delete component" onClick={onDelete} />
              </label>
            }
          </div>
        </div>
        {content}
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

  return (
    <>
      <AddComponentIcon tooltip="Add sub component" onClick={onAddComp} />
      <AddIcon tooltip="Add material" onClick={onAddMat} />
    </>
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
    <li className="re-panel-link">
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
