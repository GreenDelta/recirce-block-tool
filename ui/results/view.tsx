import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Result } from "../model";
import * as api from "../api";
import { ProgressPanel } from "../components";

type Order = Record<string, number>;

export const ResultView = () => {

  const { id } = useParams();
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    (async () => {
      const r = await api.getResult(id as string);
      setResult(r);
    })();
  }, []);

  if (!result) {
    return <ProgressPanel />;
  }

  const order = scenarioOrderOf(result);
  return (
    <>
      <nav>
        <ul>
          <li><strong>Results of: {result.analysis.name}</strong></li>
        </ul>
      </nav>
      <article className="re-panel">
        <Header result={result} />
        <EmissionRow result={result} order={order} />
      </article>
    </>
  );
};

function scenarioOrderOf(r: Result): Order {
  const scens = r.analysis?.scenarios;
  if (!scens) {
    return {};
  }
  const o: Order = {};
  for (let i = 0; i < scens.length; i++) {
    o[scens[i].name] = i;
  }
  return o;
}

const Header = ({ result }: {result: Result}) => {
  const scens = result.analysis?.scenarios;
  if (!scens) {
    return <></>;
  }
  return (
    <div className="grid">
      <div />
      {scens.map(s =>
        <div style={{textAlign: "center"}}>
          {s.name}
        </div>)}
    </div>
  );
};

const EmissionRow = ({ result, order }: {
  result: Result,
  order: Order,
}) => {

  if (!result.emissionResults) {
    return <></>;
  }

  // map the values
  let baseline = 0;
  const values: number[] = [];
  for (const e of result.emissionResults) {
    const i = order[e.scenario];
    if (i !== 0 && !i) {
      continue;
    }
    values[i] = e.value;
    if (result.analysis?.baseline === e.scenario) {
      baseline = e.value;
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
    const r = 5 + 45 * v;
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

  return (
    <div className="grid">
      <div>Carbon footprint</div>
      {circles}
    </div>
  )
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
