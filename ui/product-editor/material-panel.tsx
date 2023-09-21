import React from "react";
import * as uuid from "uuid";
import { MaterialPart, Product } from "../model";
import { MaterialList, numOf } from "./util";
import { PanelLink } from "../components";

interface Props {
  material: MaterialPart;
  product: Product;
  materials: string[];
  onChanged: () => void;
}

export const MaterialPanel = (props: Props) => {
  return (
    <article style={{ margin: "3px", paddingBottom: "15px" }}>
      <header style={{ padding: "15px", marginBottom: "15px" }}>
        <div className="grid">
          <input list="materials" className="re-panel-input"
            value={props.material.material}
            onChange={e => {
              props.material.material = e.target.value;
              props.onChanged();
            }} />
          <div style={{ display: "inline-flex" }}>
            <input type="number" className="re-panel-input"
              value={props.material.mass}
              onChange={e => numOf(e, num => {
                props.material.mass = num;
                props.onChanged();
              })} />
            <label style={{ padding: 15 }}>g</label>
          </div>
        </div>
      </header>
      <Menu {...props} />
      <MaterialList part={props.material} {...props} />
    </article>
  );
};

const Menu = (props: Props) => {

  const part = props.material;
  const onAdd = () => {
    const mat = {
      id: uuid.v4(),
      material: "",
      mass: 1.0,
    };
    if (part.materials) {
      part.materials.push(mat);
    } else {
      part.materials = [mat];
    }
    props.onChanged();
  };

  const onDelete = () => {

  };

  return (
    <nav>
      <ul></ul>
      <ul>
        <PanelLink onClick={onAdd} label="Add material" sep />
        <PanelLink onClick={onDelete} label="Delete material" />
      </ul>
    </nav>
  );
}
