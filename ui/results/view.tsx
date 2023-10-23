import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Result } from "../model";
import * as api from "../api";
import { ProgressPanel } from "../components";

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

  return (
    <nav>
      <ul>
        <li><strong>Results of: {result.analysis.name}</strong></li>
      </ul>
    </nav>
  );
};
