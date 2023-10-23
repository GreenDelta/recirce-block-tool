import React from "react";
import { Result } from "../model";

type Order = Record<string, number>;
type Item = {
  scenario: string,
  value: number,
};

export const CircleRow = ({result, order, items }: {
  result: Result,
  order: Order,
  items: Item[],
}) => {

  // map the values
  let baseline = 0;
  const values: number[] = [];
  for (const item of items) {
    const i = order[item.scenario];
    if (i !== 0 && !i) {
      continue;
    }
    values[i] = item.value;
    if (result.analysis?.baseline === item.scenario) {
      baseline = item.value;
    }
  }

  // make the values relative
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (baseline === 0) {
      values[i] = v > 0 ? 10 : 0;
      continue;
    }
    // make it a share between 0..1
    values[i] = (
      Math.min(Math.max(Math.log10(v / baseline), -1), 1) + 2) / 2;
  }

  // create the circles
  const circles = [];
  for (const v of values) {
    const r = 5 + Math.sqrt(45 * v);
    circles.push(
      <div style={{textAlign: "center"}}>
        <div style={{margin: 15, display: "inline-block"}}>
          <svg
            width="100"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            fill={colorOf(v)}>
            <circle cx="50" cy="50" r={r} />
          </svg>
        </div>
      </div>
    );
  }

  return <>{circles}</>;
};

function colorOf(share: number): string {
  if (share <= 0.1) return "#fce4ec";
  if (share <= 0.2) return "#f8bbd0";
  if (share <= 0.3) return "#f48fb1";
  if (share <= 0.4) return "#f06292";
  if (share <= 0.5) return "#ec407a";
  if (share <= 0.6) return "#e91e63";
  if (share <= 0.7) return "#d81b60";
  if (share <= 0.8) return "#c2185b";
  if (share <= 0.9) return "#ad1457";
  return "#880e4f";
}
