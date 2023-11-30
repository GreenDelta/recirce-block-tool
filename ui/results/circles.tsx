import React from "react";

type Order = Record<string, number>;
type Item = {
  scenario: string,
  value: number,
};

export const CircleRow = ({ order, items, impact }: {
  order: Order,
  items: Item[],
  impact: "negative" | "positive",
}) => {

  // map the values
  let max = 0;
  const values: number[] = [];
  for (const item of items) {
    const i = order[item.scenario];
    if (i !== 0 && !i) {
      continue;
    }
    values[i] = item.value;
    max = Math.max(max, item.value);
  }

  // make the values relative
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (max === 0) {
      values[i] = v > 0 ? 1 : 0;
      continue;
    }
    // make it a share between 0..1
    values[i] /= max;
  }

  // create the circles
  const circles = [];
  for (const v of values) {
    const r = 5 + 35 * Math.sqrt(v);
    const color = impact === "positive"
      ? posColorOf(v)
      : negColorOf(v);
    circles.push(
      <div style={{textAlign: "center"}}>
        <div style={{margin: 15, display: "inline-block"}}>
          <svg
            width="50"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            fill={color}>
            <circle cx="50" cy="50" r={r} />
          </svg>
        </div>
      </div>
    );
  }

  return <>{circles}</>;
};

function posColorOf(share: number): string {
  if (share <= 0.1) return "#e91e63";
  if (share <= 0.2) return "#ec407a";
  if (share <= 0.3) return "#f06292";
  if (share <= 0.4) return "#f48fb1";
  if (share <= 0.5) return "#f8bbd0";
  if (share <= 0.6) return "#c8e6c9";
  if (share <= 0.7) return "#a5d6a7";
  if (share <= 0.8) return "#81c784";
  if (share <= 0.9) return "#66bb6a";
  return "#4caf50";
}

function negColorOf(share: number): string {
  if (share <= 0.1) return "#4caf50";
  if (share <= 0.2) return "#66bb6a";
  if (share <= 0.3) return "#81c784";
  if (share <= 0.4) return "#a5d6a7";
  if (share <= 0.5) return "#c8e6c9";
  if (share <= 0.6) return "#f8bbd0";
  if (share <= 0.7) return "#f48fb1";
  if (share <= 0.8) return "#f06292";
  if (share <= 0.9) return "#ec407a";
  return "#e91e63";
}
