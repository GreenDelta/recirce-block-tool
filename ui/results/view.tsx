import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Result, WasteResult } from "../model";
import * as api from "../api";
import { ProgressPanel } from "../components";
import { CircleRow } from "./circles";

type Order = Record<string, number>;
type WasteState = "reused" | "recycled" | "disposed";


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
  const props = { result, order };
  return (
    <>
      <nav>
        <ul>
          <li><strong>Results of: {result.analysis.name}</strong></li>
        </ul>
      </nav>
      <article className="re-panel">
        <Header {...props} />
        <EmissionRow {...props} />
        <WasteRow state="reused" {...props} />
        <WasteRow state="recycled" {...props} />
        <WasteRow state="disposed" {...props} />
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

const Header = ({ result }: { result: Result }) => {
  const scens = result.analysis?.scenarios;
  if (!scens) {
    return <></>;
  }
  return (
    <div className="grid">
      <div />
      {scens.map(s =>
        <div style={{ textAlign: "center" }}>
          {s.name}
        </div>)}
    </div>
  );
};

const EmissionRow = (props: {
  result: Result,
  order: Order,
}) => {
  if (!props.result.emissionResults) {
    return <></>;
  }
  const values = [];
  for (const er of props.result.emissionResults) {
    values.push(
      <div style={{ textAlign: "center" }}>
        {`${er.value?.toFixed(2)} kg CO2eq`}
      </div>);
  }

  return (
    <>
      <div className="grid" style={{ marginTop: 25 }}>
        <div>Carbon footprint</div>
        {values}
      </div>
      <div className="grid">
        <div />
        <CircleRow
          items={props.result.emissionResults}
          impact="negative"
          {...props} />
      </div>
    </>
  );
};

const WasteRow = (props: {
  result: Result,
  order: Order,
  state: WasteState,
}) => {

  if (!props.result.wasteResults) {
    return <></>;
  }

  const title = wasteTitleOf(props.state);
  const values = [];
  const circleItems = [];
  for (const wr of props.result.wasteResults) {
    const value = wasteValueOf(wr, props.state);
    values.push(
      <div style={{ textAlign: "center" }}>
        {`${value.toFixed(2)} g`}
      </div>);
    circleItems.push({
      scenario: wr.scenario,
      value
    });
  }

  return (
    <>
      <div className="grid" style={{ marginTop: 25 }}>
        <div>{title}</div>
        {values}
      </div>
      <div className="grid">
        <div />
        <CircleRow
          impact={props.state === "disposed"
            ? "negative"
            : "positive"}
          items={circleItems}
          {...props} />
      </div>
    </>
  );
};

function wasteTitleOf(state: WasteState): string {
  switch (state) {
    case "reused":
      return "Reused materials";
    case "recycled":
      return "Recycled materials";
    case "disposed":
      return "Disposed materials";
    default:
      return "error";
  }
}

function wasteValueOf(r: WasteResult, state: WasteState): number {
  switch (state) {
    case "reused":
      return r.amountReused;
    case "recycled":
      return r.amountRecycled;
    case "disposed":
      return r.amountDisposed;
    default:
      return 0;
  }
}
