import React, { useEffect, useState } from "react";
import { Process, Product } from "../model";
import { ProgressPage } from "../progress";
import * as api from "../api";
import * as uuid from "uuid";

export const ProcessEditor = () => {

  const [process, setProcess] = useState<Process | null>();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    (async () => {
      const prods = await api.getProducts();
      setProducts(prods);
      // TODO: optional loading per ID for
      // editing of existing processes; just
      // like in the product editor
      setProcess({
        id: uuid.v4(),
        name: "New waste treatment process",
      });
    })();
  }, []);

  if (!products || !process) {
    return <ProgressPage />;
  }

  const onSave = () => {};

  return (<>
    <nav>
      <ul>
        <li><strong>{process.name}</strong></li>
      </ul>
      <ul>
        <li><a onClick={onSave}>Upload process</a></li>
        <li>|</li>
        <li><a>Delete process</a></li>
      </ul>
    </nav>
  </>
  );
}
