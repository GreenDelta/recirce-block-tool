import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Product } from "../model";
import * as api from "../api";
import * as uuid from "uuid";
import { ProgressPage } from "../progress";
import { ComponentPanel } from "./component-panel";

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
        })
      }
      const mats = await api.getMaterials();
      const names = mats.map(m => m.name).sort();
      setMaterials(names);
    })();
  }, []);
  if (!materials || !product) {
    return <ProgressPage message="Loading materials..." />;
  }

  const onSave = async () => {
    try {
      await api.putProduct(product);
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
          <li><a onClick={onSave}>Upload product</a></li>
          <li>|</li>
          <li><a>Delete product</a></li>
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
        onSave={() => api.putProduct(product)}
      />
    </>
  );
};
