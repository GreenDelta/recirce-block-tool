import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Scenario, Product } from "../model";
import * as api from "../api";
import * as uuid from "uuid";
import { ProgressPanel } from "../components";
import { ScenarioStepPanel } from "./step-panel";
import { AddIcon, DeleteIcon, SaveIcon } from "../icons";

export const ScenarioEditor = () => {

  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setLoading] = useState(false);
  const [processes, setProcesses] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [scenario, setScenario] = useState<Scenario | null>(null)

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (typeof id === "string") {
        const s = await api.getScenario(id);
        setScenario(s);
      } else {
        setScenario({
          id: uuid.NIL,
          name: "New waste treatment scenario",
        });
      }
      const prods = await api.getProducts();
      setProducts(prods);
      const procs = await api.getProcesses();
      procs.sort();
      setProcesses(procs);
      setLoading(false);
    })();
  }, []);

  if (isLoading || !scenario) {
    return <ProgressPanel />;
  }

  const onChanged = () => setScenario({ ...scenario });

  const onSave = async () => {
    setLoading(true);
    const created = scenario.id === uuid.NIL;
    if (created) {
      scenario.id = uuid.v4();
    }
    await api.putScenario(scenario);
    if (created) {
      onChanged();
    }
    setLoading(false);
  };

  const onDelete = async () => {
    if (scenario.id === uuid.NIL) {
      return;
    }
    setLoading(true);
    await api.deleteScenario(scenario.id);
    navigate('/ui/scenarios');
  };

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
        <li><SaveIcon onClick={onSave} tooltip="Save scenario" /></li>
        {scenario.id !== uuid.NIL
          ? <li><DeleteIcon onClick={onDelete} tooltip="Delete scenario" /></li>
          : <></>
        }
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
