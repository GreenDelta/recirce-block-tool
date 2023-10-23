import React from "react";
import { Analysis } from "../model";
import * as uuid from "uuid";
import { CalcIcon, DeleteIcon, SaveIcon } from "../icons";

export const EditorHeader = (props: {
  analysis: Analysis,
  onSave: () => void,
  onDelete: () => void,
  onCalculate: () => void,
}) => {

  const a = props.analysis;
  const icons = [
    <li>
      <SaveIcon tooltip="Save analysis"
        onClick={props.onSave} />
    </li>
  ];
  if (a.id !== uuid.NIL) {
    icons.push(
      <li>
        <CalcIcon tooltip="Calculate"
          onClick={props.onCalculate} />
      </li>
    );
    icons.push(
      <li>
        <DeleteIcon tooltip="Delete analysis"
          onClick={props.onDelete} />
      </li>
    );
  }

  return (
    <nav>
      <ul>
        <li><strong>{a.name}</strong></li>
      </ul>
      <ul>
        {icons}
      </ul>
    </nav>
  );
};
