import React from "react";
import { MaterialPanel } from "./material-panel";
import { Product, ProductPart } from "../model";

export const MaterialList = (props: {
  part: ProductPart;
  product: Product;
  materials: string[];
  onChanged: () => void;
}) => {
  const panels = [];
  if (props.part.materials) {
    for (const mat of props.part.materials) {
      panels.push(
        <MaterialPanel
          key={mat.id}
          material={mat}
          product={props.product}
          materials={props.materials}
          onChanged={props.onChanged}
        />
      );
    }
  }
  return <>{panels}</>
};

export function numOf(
  e: React.ChangeEvent<HTMLInputElement>, f: (n: number) => void
) {
  const s = e?.target?.value;
  if (!s) {
    return;
  }
  try {
    const num = Number.parseFloat(s);
    f(num)
  } catch {
    // nothing
  }
}
