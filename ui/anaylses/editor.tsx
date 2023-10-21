import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Analysis, Scenario, Product } from "../model";
import * as api from "../api";
import * as uuid from "uuid";
import { ProgressPanel } from "../components";
import { ScenarioStepPanel } from "./step-panel";
import { AddIcon, DeleteIcon, SaveIcon } from "../icons";

export const AnalysisEditor = () => {

  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (typeof id === "string") {
        const a = await api.getAnalysis(id);
        setAnalysis(s);
      } else {
        setAnalysis({
          id: uuid.NIL,
          name: "New analysis",
        });
      }
      const scens = await api.getScenarios();
      setScenarios(scens);
      setLoading(false);
    })();
  }, []);

  if (isLoading || !analysis) {
    return <ProgressPanel />;
  }

  const onChanged = () => setAnalysis({ ...analysis });

  const onSave = async () => {
    setLoading(true);
    const created = analysis.id === uuid.NIL;
    if (created) {
      analysis.id = uuid.v4();
    }
    await api.putAnaylsis(analysis);
    if (created) {
      onChanged();
    }
    setLoading(false);
  };

  const onDelete = async () => {
    if (analysis.id === uuid.NIL) {
      return;
    }
    setLoading(true);
    await api.deleteAnalysis(analysis.id);
    navigate('/ui/analysis');
  };

  return (
    <>
      <nav>
        <ul>
          <li><strong>{analysis.name}</strong></li>
        </ul>
        <ul>
          <li><SaveIcon onClick={onSave} tooltip="Save analysis" /></li>
          {analysis.id !== uuid.NIL
            ? <li><DeleteIcon onClick={onDelete} tooltip="Delete analysis" /></li>
            : <></>
          }
        </ul>
      </nav>
      <article className="re-panel">
        <div className="grid">
          <div className="re-flex-div">
            <input type="text" className="re-panel-input"
              value={analysis.name}
              onChange={e => {
                scenario.name = e.target.value;
                onChanged();
              }} />
          </div>
        </div>
        <ScenarioTable
          analysis={analysis}
          scenarios={scenarios}
          onChanged={onChanged} />
      </article>
    </>
  );
}

const ScenarioTable = ({ analysis, scenarios, onChanged }: {
  analysis: Analysis,
  scenarios: Scenario[],
  onChanged: () => void,
}) => {

  const [ nextScenario, setNextScenario ]  = useState<Scenario | null>(null);

  const rows = [];
  if (analysis.scenarios) {
    let i = 0;
    for (const s of analysis.scenarios) {
      i++;
      rows.push(
        <tr>
          <td>{i}</td>
          <td>{s.name}</td>
          <td>{s.product?.name}</td>
          <td>
            <DeleteIcon tooltip="Remove scenario from analysis"
              onClick={() => {
                remove(s, analysis);
                onChanged();
              }} />
          </td>
        </tr>
      );
    }
  }

  const onSelectNext = (id: string) => {
    if (!id) {
      setNextScenario(null);
      return;
    }
    for(const s of scenarios) {
      if (id === s.id) {
        setNextScenario(s);
        break;
      }
    }
  };

  // combo-box
  const comboRows = [ <option value="" /> ];
  scenarios.filter(s => canAdd(s, analysis))
    .forEach(s => {
      const selected = nextScenario?.id === s.id || false;
      const option = (
        <option
          value={s.id}
          selected={selected}>{s.name}</option>);
      comboRows.push(option);
    });
  const scenarioCombo = (
    <select
      onChange={e => onSelectNext(e.target.value)}
      value={nextScenario ? nextScenario.id : ""}>
      {comboRows}
    </select>
  );

  const onAdd = () => {
    if (!nextScenario) {
      return;
    }
    if (!analysis.scenarios) {
      analysis.scenarios = [nextScenario];
    } else {
      analysis.scenarios.push(nextScenario);
    }
    onChanged();
  };

  return (
    <table>
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Scenario</th>
          <th scope="col">Product</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        {rows}
        <tr>
          <td>
            <AddIcon
              tooltip="Add scenario"
              onClick={onAdd}
            />
          </td>
          <td>
            {scenarioCombo}
          </td>
          <td />
          <td />
        </tr>
      </tbody>
    </table>
  );
};

function canAdd(scenario: Scenario, analysis: Analysis): boolean {
  if (!analysis.scenarios) {
    return true;
  }
  for (const s of analysis.scenarios) {
    if (s.id === scenario.id) {
      return false;
    }
  }
  return true;
}

function remove(scenario: Scenario, analysis: Analysis) {
  if (!analysis.scenarios) {
    return;
  }
  let idx = -1;
  for (let i = 0; i < analysis.scenarios.length; i++) {
    const s = analysis.scenarios[i];
    if (s.id === scenario.id) {
      idx = i;
      break;
    }
  }
  if (idx >= 0) {
    analysis.splice(idx, 1);
  }
}
