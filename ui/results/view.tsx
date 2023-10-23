import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Result } from "../model";
import * as api from "../api";
import { ProgressPanel } from "../components";
import { CircleRow } from "./circles";

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

const EmissionRow = (props: {
  result: Result,
  order: Order,
}) => {
  if (!props.result.emissionResults) {
    return <></>;
  }
  return (
    <div className="grid">
      <div>Carbon footprint</div>
      <CircleRow
        items={props.result.emissionResults}
        {...props} />
    </div>
  );
};

const WasteRow = (props: {
  result: Result,
  order: Order,
  state: "reused" | "recycled",
}) => {

  if (!props.result.wasteResults) {
    return <></>;
  }

  const title = props.state === "reused"
    ? "Reused materials"
    : "Recycled materials";
  const values = [];
  const circleItems = [];
  for (const wr of props.result.wasteResults) {
    const value = props.state == "reused"
      ? wr.amountReused
      : wr.amountRecycled;
    values.push(
      <div style={{textAlign: "center"}}>
        {`${value.toFixed(4)} g`}
      </div>);
    circleItems.push({
      scenario: wr.scenario,
      value
    });
  }

  return (
    <>
      <div className="grid">
        <div>{title}</div>
        {values}
      </div>
      <div className="grid">
        <div />
        <CircleRow items={circleItems} {...props} />
      </div>
    </>
  );
};
