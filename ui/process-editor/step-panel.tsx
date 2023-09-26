import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Treatment, TreatmentStep } from '../model';
import { ExpandLessIcon, ExpandMoreIcon } from '../icons';
import * as util from "./util";

interface Props {
  step: TreatmentStep;
  process: Treatment;
  onChanged: () => void;
}

export const ProcessStepPanel: React.FC<Props> = (props) => {
  const [collapsed, setCollapsed] = useState(false);

  const expander = collapsed
    ? <ExpandLessIcon tooltip="Collapse" onClick={() => setCollapsed(false)} />
    : <ExpandMoreIcon tooltip="Expand" onClick={() => setCollapsed(true)} />;

  const onDelete = () => {
    const t = util.parentOf(props.step, props.process);
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
            <input
        list="processes"
        className="re-panel-input"
        value={c.name}
        onChange={e => {
          c.name = e.target.value
          props.onChanged();
        }} />
          </div>
          <div className="re-flex-div">
            <input
              type="number"
              className="re-panel-input"
              value={props.step.energyDemand}
              onChange={(e) => util.numOf(e, num => {
                // Implement energy demand change logic
                props.step.energyDemand = num;
                props.onChanged();
              })}
            />
            {!props.isRoot && (
              <label>
                <DeleteIcon tooltip="Delete step" onClick={onDelete} />
              </label>
            )}
          </div>
        </div>
        {collapsed ? <></> : <StepList {...props} />}
      </article>
    </>
  );
};

const Menu = (props: Props) => {
  const onAdd = () => {
    const sub: TreatmentStep = {
      id: uuid(),
      name: 'New step',
      energyDemand: 0,
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
      list.push(<ProcessStepPanel key={step.id} {...subProps} />);
    }
  }
  return <>{list}</>;
};
