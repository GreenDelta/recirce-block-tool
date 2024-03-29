import React from 'react';
import { AddIcon, DeleteIcon } from '../icons';
import { Fraction, Scenario, FractionState, ScenarioStep } from '../model';
import * as util from "./util";
import { numOf } from "../components";
import * as uuid from "uuid";

interface Props {
  step: ScenarioStep
  scenario: Scenario;
  onChanged: () => void;
}

export const FractionTable = (props: Props) => {

  const rows = [];
  if (props.step.fractions) {
    for (const f of props.step.fractions) {
      rows.push(
        <FractionRow key={f.id} {...props} fraction={f} />
      );
    }
  }

  const onAdd = () => {
    const f = {
      id: uuid.v4(),
      value: 100,
      state: FractionState.PassedThrough
    };
    if (props.step.fractions) {
      props.step.fractions.push(f);
    } else {
      props.step.fractions = [f];
    }
    props.onChanged();
  }

  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Component</th>
          <th scope="col">Faction</th>
          <th scope="col">Mass</th>
          <th scope="col">State</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        {rows}
        <tr>
          <td><AddIcon onClick={onAdd} tooltip="Add fraction"/></td>
          <td />
          <td />
          <td />
          <td />
        </tr>
      </tbody>
    </table>
  );

};

const FractionRow = (props: Props & { fraction: Fraction }) => {

  const frac = props.fraction;
  const fractions = util.listFractions(props.scenario, props.step);

  const components = [
    <option value=""></option>
  ];
  for (const f of fractions) {
    if (!f.component) {
      continue;
    }
    const label = util.labelOf(f.component, props.scenario.product!);
    components.push(<option value={f.component.id}>{label}</option>)
  }

  const selector = <select className="re-table-control"
    value={props.fraction.component?.id}
    onChange={e => {
      const id = e.target.value;
      const fi = fractions.find(f => f.component?.id === id);
      if (!fi) {
        delete frac.component;
      } else {
        frac.component = fi.component;
        frac.value = fi.value;
      }
      props.onChanged();
    }}>
    {components}
  </select>;

  const mass = !frac.component
    ? 0
    : frac.value * frac.component.mass / 100;

  const onDelete = () => {
    const step = props.step;
    if (!step.fractions) {
      return;
    }
    const id = frac.id;
    let idx = -1;
    for (let i = 0; i < step.fractions.length; i++) {
      if (id === step.fractions[i].id) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) {
      step.fractions.splice(idx, 1);
      props.onChanged();
    }
  };

  return (
    <tr>
      <td>{selector}</td>
      <td>
        <div className="re-flex-div">
          <input type="number" className="re-table-control"
            min={0}
            max={100}
            value={frac.value}
            onChange={e => numOf(e, num => {
              frac.value = num;
              props.onChanged();
            })}
          />
          <label> %</label>
        </div>
      </td>
      <td>{`${mass.toFixed(3)} g`}</td>
      <td><StateCombo state={frac.state} onChange={s => {
        frac.state = s;
        props.onChanged();
      }} />
      </td>
      <td>
        <DeleteIcon tooltip="Delete fraction" onClick={onDelete} />
      </td>
    </tr>
  );
}

const StateCombo = ({ state, onChange }: {
  state: FractionState,
  onChange: (s: FractionState) => void,
}) => {
  const states = [
    FractionState.Disposed,
    FractionState.PassedThrough,
    FractionState.Recycled,
  ];
  return (
    <select className="re-table-control"
      value={state}
      onChange={e => onChange(e.target.value as FractionState)}>
      {states.map(s => <option value={s}>{s}</option>)}
    </select>
  );
}
