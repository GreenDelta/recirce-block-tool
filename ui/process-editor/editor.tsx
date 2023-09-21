import React, { useEffect, useState } from "react";
import { Process, Product } from "../model";
import * as api from "../api";
import * as uuid from "uuid";
import { ProgressPanel } from "../components";

export const ProcessEditor = () => {

  const [process, setProcess] = useState<Process | null>();
  const [products, setProducts] = useState<Product[] | null>(null);

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
    return <ProgressPanel />;
  }

  const onSave = () => { };
  const onChange = () => setProcess({ ...process });

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
    <article style={{ margin: 3, padding: 10 }}>
      <div className="grid">
        <div>
          <label>
            Name
            <input type="text" value={process.name}
              onChange={e => {
                process.name = e.target.value;
                onChange();
              }} />
          </label>
        </div>
        <div>
          <ProductCombo
            process={process}
            products={products}
            onChange={onChange} />
        </div>
      </div>

    </article>
  </>
  );
}

const ProductCombo = ({ process, products, onChange }: {
  process: Process,
  products: Product[],
  onChange: () => void,
}) => {
  const options = [];
  options.push(<option value=""></option>);
  for (const p of products) {
    const isSelected = process.product?.id === p.id || false;
    options.push(
      <option value={p.id} selected={isSelected}>
        {p.name}
      </option>
    );
  }

  const handleChange = (id: string) => {
    if (!id) {
      delete process.product;
    } else {
      for (const p of products) {
        if (p.id === id) {
          process.product = p;
          break;
        }
      }
    }
    onChange();
  };

  return (
    <label>
      Product
      <select onChange={e => handleChange(e.target.value)}>
        {options}
      </select>
    </label>
  );
}
