import React, { useState } from "react";
import { Component, Product, findParentComponent, nextPartMassOf } from "../model";
import * as uuid from "uuid";
import { numOf } from "../components";

import {
  AddComponentIcon,
  AddIcon,
  DeleteIcon,
  ExpandLessIcon,
  ExpandMoreIcon
} from "../icons";

interface Props {
  isRoot?: boolean;
  component: Component;
  product: Product;
  materials: string[];
  onChanged: () => void;
}

export const ComponentPanel = (props: Props) => {

  const [collapsed, setCollapsed] = useState(false);

  const expander = collapsed
    ? <ExpandLessIcon tooltip="Collapse" onClick={() => setCollapsed(false)} />
    : <ExpandMoreIcon tooltip="Expand" onClick={() => setCollapsed(true)} />;

  const onDelete = () => {
    const t = findParentComponent(props.component, props.product);
    if (!t) {
      return;
    }
    const [parent, idx] = t;
    if (parent.parts && idx >= 0) {
      parent.parts.splice(idx, 1);
      props.onChanged();
    }
  };

  return (
    <>
      <article className="re-panel">
        <div className="grid">
          <div className="re-flex-div">
            <div className="re-panel-toolbar">
              {expander}
              {!collapsed && <Menu {...props} /> || <></>}
            </div>
            <NameInput {...props} />
          </div>
          <div className="re-flex-div">
            <input type="number" className="re-panel-input"
              value={props.component.mass}
              onChange={(e) => numOf(e, num => {
                props.component.mass = num;
                props.onChanged();
              })}
            />
            <MassFraction {...props} />
            {!props.isRoot &&
              <label>
                <DeleteIcon tooltip="Delete component" onClick={onDelete} />
              </label>
            }
          </div>
        </div>
        {collapsed ? <></> : <PartList {...props} />}
      </article>
    </>
  );
};

const Menu = (props: Props) => {
  const c = props.component;

  const onAdd = (isMaterial: boolean) => {
    const sub: Component = {
      id: uuid.v4(),
      name: isMaterial ? "New material" : "New component",
      mass: nextPartMassOf(c),
      isMaterial,
    };
    if (c.parts) {
      c.parts.push(sub);
    } else {
      c.parts = [sub];
    }
    props.onChanged();
  };

  const matIcon = <AddIcon
    tooltip="Add material"
    onClick={() => onAdd(true)} />;

  if (c.isMaterial) {
    return matIcon;
  }

  return (
    <>
      <AddComponentIcon
        tooltip="Add sub component"
        onClick={() => onAdd(false)} />
      {matIcon}
    </>
  );
};

const NameInput = (props: Props) => {
  const c = props.component;
  if (c.isMaterial) {
    return (
      <input
        list="materials"
        className="re-panel-input"
        value={c.name}
        onChange={e => {
          c.name = e.target.value
          props.onChanged();
        }} />
    );
  }
  return (
    <input
      type="text"
      className="re-panel-input"
      value={c.name}
      onChange={(e) => {
        c.name = e.target.value;
        props.onChanged();
      }} />
  );
}

const PartList = (props: Props) => {
  const list = [];
  const c = props.component;
  if (c.parts) {
    for (const part of c.parts) {
      const subProps = {
        ...props, component: part, isRoot: false
      };
      list.push(<ComponentPanel key={c.id} {...subProps} />);
    }
  }
  return <>{list}</>;
}

const MassFraction = (props: Props) => {
  if (props.isRoot) {
    return <label>g</label>;
  }
  const calc = (mass: number) => {
    if (mass === 0) {
      return 0;
    }
    const productMass = props.product.mass;
    if (!mass || !productMass) {
      return NaN;
    }
    return 100 * mass / productMass;
  };

  const f = calc(props.component.mass);
  const isInvalid = isNaN(f) || f < 0 || f > 100;
  return (
    <label style={{ whiteSpace: "nowrap" }}>
      g &asymp; {" "}
      <span style={isInvalid ? { color: "red" } : {}}>
        {isNaN(f) ? "NaN" : `${f.toFixed(2)}%`}
      </span>
    </label>
  );
};
