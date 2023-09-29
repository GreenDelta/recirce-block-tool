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
  const { id } = useParams();
  const [isLoading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<string[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (typeof id === "string") {
        const p = await api.getProduct(id);
        setProduct(p);
      } else {
        setProduct({
          id: uuid.NIL,
          name: "New product",
          mass: 1.0,
          isMaterial: false,
        })
      }
      const mats = await api.getMaterials();
      const names = mats.map(m => m.name).sort();
      setMaterials(names);
      setLoading(false);
    })();
  }, []);

  if (isLoading || !product) {
    return <ProgressPanel />;
  }

  const onSave = async () => {
    setLoading(true);
    const created = product.id === uuid.NIL;
    if (created) {
      product.id = uuid.v4();
    }
    await api.putProduct(product);
    if (created) {
      setProduct({ ...product });
    }
    setLoading(false);
  }

  const onDelete = async () => {
    if (product.id === uuid.NIL) {
      return;
    }
    setLoading(true);
    await api.deleteProduct(product.id);
    navigate("/ui/products");
  }

  return (
    <>
      <nav>
        <ul>
          <li><strong>{product.name}</strong></li>
        </ul>
        <ul>
          <li><SaveIcon onClick={onSave} tooltip="Save product" /></li>
          {product.id !== uuid.NIL
            ? <li><DeleteIcon onClick={onDelete} tooltip="Delete product" /></li>
            : <></>
          }
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
