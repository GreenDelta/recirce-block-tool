import React, { useState } from "react";
import { Component, Product } from "../model";
import * as uuid from "uuid";
import * as util from "./util";

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

  const comp = props.component;
  const subComps = [];
  if (comp.parts) {
    for (const c of comp.parts) {
      const subProps = { ...props, component: c, isRoot: false };
      subComps.push(<ComponentPanel key={c.id} {...subProps} />);
    }
  }

  const expander = collapsed
    ? <ExpandLessIcon tooltip="Collapse" onClick={() => setCollapsed(false)} />
    : <ExpandMoreIcon tooltip="Expand" onClick={() => setCollapsed(true)} />;

  const onDelete = () => {
    const t = util.parentOf(props.component, props.product);
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
              value={comp.mass}
              onChange={(e) => util.numOf(e, num => {
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
        {<PartList collapsed={collapsed} {...props} />}
      </article>
    </>
  );
};

const Menu = (props: Props) => {
  const c = props.component;

  const onAdd = (isMaterial: boolean) => {
    const sub: Component = {
      id: uuid.v4(),
      name: isMaterial ? "New component" : "",
      mass: util.nextPartMassOf(c),
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
        value={c.material}
        onChange={e => {
          c.name = e.target.value
          c.material = e.target.value;
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

const PartList = (props: Props & { collapsed: boolean }) => {
  if (props.collapsed) {
    return <></>;
  }
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
