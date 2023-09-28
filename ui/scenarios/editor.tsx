import React, { useEffect, useState } from "react";
import { Scenario, Product } from "../model";
import * as api from "../api";
import * as uuid from "uuid";
import { ProgressPanel } from "../components";
import { ScenarioStepPanel } from "./step-panel";
import { AddIcon } from "../icons";

export const ScenarioEditor = () => {

  const [processes, setProcesses] = useState<string[] | null>();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null)

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
      setScenario({
        id: uuid.v4(),
        name: "New waste treatment",
      });
    })();
  }, []);

  if (!products || !processes || !scenario) {
    return <ProgressPanel />;
  }

  const onSave = () => { };
  const onChanged = () => setScenario({ ...scenario });

  const onAddStep = () => {
    const step = {
      id: uuid.v4()
    };
    if (scenario.steps) {
      scenario.steps.push(step);
    } else {
      scenario.steps = [step];
    }
    onChanged();
  }

  const stepPanels = [];
  if (scenario.steps) {
    for (const step of scenario.steps) {
      stepPanels.push(
        <ScenarioStepPanel
          key={step.id}
          processes={processes}
          scenario={scenario}
          step={step}
          onChanged={onChanged} />);
    }
  }

  return (<>
    <nav>
      <ul>
        <li><strong>{scenario.name}</strong></li>
      </ul>
      <ul>
        <li><a onClick={onSave}>Upload process</a></li>
        <li>|</li>
        <li><a>Delete process</a></li>
      </ul>
    </nav>
    <article className="re-panel">
      <div className="grid">
        <div className="re-flex-div">
          <div className="re-panel-toolbar">
            {scenario.product
              ? <AddIcon onClick={onAddStep} />
              : <></>
            }
          </div>
          <input type="text" className="re-panel-input"
            value={scenario.name}
            onChange={e => {
              scenario.name = e.target.value;
              onChanged();
            }} />
        </div>
        <div>
          {scenario.product
            ? <input value={scenario.product.name} readOnly />
            : <ProductCombo
              treatment={scenario}
              products={products}
              onChange={onChanged} />
          }
        </div>
      </div>
      {stepPanels}
    </article>
  </>
  );
}

const ProductCombo = ({ treatment, products, onChange }: {
  treatment: Scenario,
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
    <select
      className="re-panel-input"
      placeholder="Select a product"
      onChange={e => handleChange(e.target.value)}>
      {options}
    </select>
  );
}
