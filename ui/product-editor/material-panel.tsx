import React, { useState } from "react";
import * as uuid from "uuid";
import { MaterialPart, Product } from "../model";
import { MaterialList, numOf } from "./util";
import { PanelLink } from "../components";
import { AddIcon, DeleteIcon, ExpandLessIcon, ExpandMoreIcon } from "../icons";

interface Props {
  material: MaterialPart;
  product: Product;
  materials: string[];
  onChanged: () => void;
}

export const MaterialPanel = (props: Props) => {

  const [collapsed, setCollapsed] = useState(false);
  const icon = collapsed
    ? <ExpandLessIcon tooltip="Collapse" onClick={() => setCollapsed(false)} />
    : <ExpandMoreIcon tooltip="Expand" onClick={() => setCollapsed(true)} />;

  const content = collapsed
    ? <></>
    : <>
      <article className="re-panel">
      <Menu {...props} />
      <MaterialList part={props.material} {...props} />
      </article>
    </>

  const onDelete = () => {
    // TODO: not yet implemented
  };

  return (
    <article className="re-panel">
      <div className="grid">
        <div className="re-flex-div">
          <label>
            {icon}
          </label>
          <input list="materials" className="re-panel-input"
            value={props.material.material}
            onChange={e => {
              props.material.material = e.target.value;
              props.onChanged();
            }} />
        </div>
        <div className="re-flex-div">
          <input type="number" className="re-panel-input"
            value={props.material.mass}
            onChange={e => numOf(e, num => {
              props.material.mass = num;
              props.onChanged();
            })} />
          <label>g</label>
          <label>
            <DeleteIcon tooltip="Delete component" onClick={onDelete} />
          </label>
        </div>
      </div>
      {content}
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

  return (
     <AddIcon tooltip="Add a sub material" onClick={onAdd}/>
  );
}
