import React, { useEffect, useState } from "react";
import { Treatment, TreatmentStep, Product } from "../model";
import * as api from "../api";
import * as uuid from "uuid";
import { PanelLink, ProgressPanel } from "../components";

export const TreatmentEditor = () => {

  const [processes, setProcesses] = useState<string[] | null>();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [treatment, setTreatment] = useState<Treatment | null>(null)

  useEffect(() => {
    (async () => {
      const prods = await api.getProducts();
      setProducts(prods);
      const procs = await api.getProcesses();
      procs.sort();
      setProcesses(procs)
      // TODO: optional loading per ID for
      // editing of existing processes; just
      // like in the product editor
      setTreatment({
        id: uuid.v4(),
        name: "New waste treatment",
      });
    })();
  }, []);

  if (!products || !processes || !treatment) {
    return <ProgressPanel />;
  }

  const onSave = () => { };
  const onChange = () => setTreatment({ ...treatment });

  return (<>
    <nav>
      <ul>
        <li><strong>{treatment.name}</strong></li>
      </ul>
      <ul>
        <li><a onClick={onSave}>Upload process</a></li>
        <li>|</li>
        <li><a>Delete process</a></li>
      </ul>
    </nav>
    <datalist id="processes">
      {processes.map(p => <option value={p} />)}
    </datalist>
    <article className="re-panel">
      <div className="grid">
        <div>
          <label>
            Name
            <input type="text" className="re-panel-input"
              value={treatment.name}
              onChange={e => {
                treatment.name = e.target.value;
                onChange();
              }} />
          </label>
        </div>
        <div>
          <ProductCombo
            treatment={treatment}
            products={products}
            onChange={onChange} />
        </div>
      </div>
      <nav>
        <ul />
        <ul>
          <PanelLink label="Add treatment step" onClick={() => {
            const step: TreatmentStep = {
              id: uuid.v4(),
            };
            if (treatment.steps) {
              treatment.steps.push(step);
            } else {
              treatment.steps = [step];
            }
            onChange();
          }} />
        </ul>
      </nav>
    </article>
  </>
  );
}

const ProductCombo = ({ treatment, products, onChange }: {
  treatment: Treatment,
  products: Product[],
  onChange: () => void,
}) => {
  const options = [];
  options.push(<option value=""></option>);
  for (const p of products) {
    const isSelected = treatment.product?.id === p.id || false;
    options.push(
      <option value={p.id} selected={isSelected}>
        {p.name}
      </option>
    );
  }

  const handleChange = (id: string) => {
    if (!id) {
      delete treatment.product;
    } else {
      for (const p of products) {
        if (p.id === id) {
          treatment.product = p;
          break;
        }
      }
    }
    onChange();
  };

  return (
    <label>
      Product
      <select className="re-panel-input"
        onChange={e => handleChange(e.target.value)}>
        {options}
      </select>
    </label>
  );
}
