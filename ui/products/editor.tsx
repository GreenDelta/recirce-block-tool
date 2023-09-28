import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Product } from "../model";
import * as api from "../api";
import * as uuid from "uuid";
import { ComponentPanel } from "./component-panel";
import { ProgressPanel } from "../components";
import { DeleteIcon, SaveIcon } from "../icons";

export const ProductEditor = () => {

  const navigate = useNavigate();
  const {id} = useParams();
  const [materials, setMaterials] = useState<string[] | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    (async () => {
      if (typeof id === "string") {
        const p = await api.getProduct(id);
        setProduct(p);
      } else {
        setProduct({
          id: uuid.v4(),
          name: "New product",
          mass: 1.0,
          isMaterial: false,
        })
      }
      const mats = await api.getMaterials();
      const names = mats.map(m => m.name).sort();
      setMaterials(names);
    })();
  }, []);
  if (!materials || !product) {
    return <ProgressPanel />;
  }

  const onSave = async () => {
    try {
      await api.putProduct(product);
      navigate("/ui/products");
    } catch (e) {
      console.log(e);
    }
  }

  const onDelete = async () => {
    try {
      await api.deleteProduct(product.id);
      navigate("/ui/products");
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <>
      <nav>
        <ul>
          <li><strong>{product.name}</strong></li>
        </ul>
        <ul>
          <li><SaveIcon onClick={onSave} tooltip="Save product"/></li>
          <li><DeleteIcon onClick={onDelete} tooltip="Delete product"/></li>
        </ul>
      </nav>
      <datalist id="materials">
        {materials.map(m => <option value={m} />)}
      </datalist>
      <ComponentPanel
        key={product.id}
        isRoot
        product={product}
        materials={materials}
        component={product}
        onChanged={() => setProduct({ ...product })}
      />
    </>
  );
};
