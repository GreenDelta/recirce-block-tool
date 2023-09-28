import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Scenario, ScenarioStep } from '../model';
import { AddIcon, DeleteIcon, ExpandLessIcon, ExpandMoreIcon } from '../icons';
import * as util from "./util";
import { FractionTable } from './fractions';

interface Props {
  step: ScenarioStep;
  scenario: Scenario;
  processes: string[];
  onChanged: () => void;
}

export const ScenarioStepPanel: React.FC<Props> = (props) => {
  const [collapsed, setCollapsed] = useState(false);

  const expander = collapsed
    ? <ExpandLessIcon tooltip="Collapse" onClick={() => setCollapsed(false)} />
    : <ExpandMoreIcon tooltip="Expand" onClick={() => setCollapsed(true)} />;

  const onDelete = () => {
    const t = util.parentOf(props.step, props.scenario);
    if (!t) {
      return;
    }
    const [parent, idx] = t;
    if (parent.steps && idx >= 0) {
      parent.steps.splice(idx, 1);
      props.onChanged();
    }
  };

  return (
    <>
      <article className="re-panel">
        <div className="grid">
          <div className="re-flex-div">
            <div className="re-panel-toolbar">
              {expander}
              {!collapsed && <Menu {...props} /> || <></>}
            </div>
            <ProcessSelector {...props} />
            <label>
              <DeleteIcon tooltip="Delete process step" onClick={onDelete} />
            </label>
          </div>
        </div>
        {collapsed
          ? <></>
          : <>
            <FractionTable {...props} />
            <StepList {...props} />
          </>}
      </article>
    </>
  );
};

const Menu = (props: Props) => {
  const onAdd = () => {
    const sub: ScenarioStep = {
      id: uuid(),
    };
    if (props.step.steps) {
      props.step.steps.push(sub);
    } else {
      props.step.steps = [sub];
    }
    props.onChanged();
  };

  return (
    <>
      <AddIcon tooltip="Add sub step" onClick={onAdd} />
    </>
  );
};

const StepList = (props: Props) => {
  const list = [];
  if (props.step.steps) {
    for (const step of props.step.steps) {
      const subProps = {
        ...props,
        step: step,
        isRoot: false,
      };
      list.push(<ScenarioStepPanel key={step.id} {...subProps} />);
    }
  }
  return <>{list}</>;
};

const ProcessSelector = (props: Props) => {
  const options = [
    <option value="" placeholder="Select a process" />
  ];
  for (const p of props.processes) {
    options.push(
      <option value={p}>{p}</option>
    );
  }
  return (
    <select
      value={props.step.process}
      onChange={e => {
        props.step.process = e.target.value
        props.onChanged();
      }}>
      {options}
    </select>
  );
}
