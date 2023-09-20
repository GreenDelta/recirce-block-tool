import React from "react";

import { Product, ProductPart } from "../model";
import { PanelLink } from "./util";

interface MatProps {
  material: ProductPart;
  product: Product;
  materials: string[];
  onChanged: () => void;
}

export const MaterialPanel = (props: MatProps) => {
  const onDelete = () => { };

  return (
    <article style={{ margin: "3px", paddingBottom: "15px" }}>
      <header style={{ padding: "15px", marginBottom: "15px" }}>
        <div className="grid">
          <input list="materials" />
          <div style={{ display: "inline-flex" }}>
            <input
            type="number"
            value={props.material.mass}
            onChange={() => {}}/>
            <label style={{ padding: 15 }}>g</label>
          </div>
        </div>
      </header>
      <nav>
        <ul></ul>
        <ul>
          <PanelLink onClick={() => {}} label="Add material" sep />
          <PanelLink onClick={onDelete} label="Delete material" />
        </ul>
      </nav>
    </article>
  );
};
