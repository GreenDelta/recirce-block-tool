import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Treatment, TreatmentStep } from '../model';
import { AddIcon, DeleteIcon, ExpandLessIcon, ExpandMoreIcon } from '../icons';
import * as util from "./util";

interface Props {
  step: TreatmentStep;
  treatment: Treatment;
  onChanged: () => void;
}

export const ProcessStepPanel: React.FC<Props> = (props) => {
  const [collapsed, setCollapsed] = useState(false);

  const expander = collapsed
    ? <ExpandLessIcon tooltip="Collapse" onClick={() => setCollapsed(false)} />
    : <ExpandMoreIcon tooltip="Expand" onClick={() => setCollapsed(true)} />;

  const onDelete = () => {
    const t = util.parentOf(props.step, props.treatment);
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
              value={props.step.process}
              onChange={e => {
                props.step.process = e.target.value
                props.onChanged();
              }} />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Component</th>
              <th scope="col">Faction</th>
              <th scope="col">Mass</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td><select></select></td>
              <td><input type="number" /></td>
              <td>5 g</td>
              <td><DeleteIcon /></td>
            </tr>
          </tbody>
        </table>
        {collapsed ? <></> : <StepList {...props} />}
      </article>
    </>
  );
};

const Menu = (props: Props) => {
  const onAdd = () => {
    const sub: TreatmentStep = {
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
      list.push(<ProcessStepPanel key={step.id} {...subProps} />);
    }
  }
  return <>{list}</>;
};
