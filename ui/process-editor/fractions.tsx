import React from 'react';
import { DeleteIcon } from '../icons';
import { Fraction, Treatment, TreatmentStep } from '../model';
import * as util from "./util";


interface Props {
  step: TreatmentStep
  treatment: Treatment;
  onChanged: () => void;
}

export const FractionTable = (props: Props) => {

  return (
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
          <td><FractionCombo {...props}/></td>
          <td><input type="number" /></td>
          <td>5 g</td>
          <td><DeleteIcon /></td>
        </tr>
      </tbody>
    </table>
  );

};

const FractionRow = (props: Props & {fraction: Fraction}) => {

}

const FractionCombo = (props: Props & {onSelect: (f:Fraction) => void}) => {
  const fractions = util.listFractions(props.treatment, props.step);
  const options = fractions.map(f => {
    const label = util.labelOf(f.component, props.treatment.product!);
    return <option value={f.component.id}>{label}</option>
  });
  return (
    <select>
      {options}
    </select>
  )
}
