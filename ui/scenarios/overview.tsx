import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as api from "../api";
import { ProgressPanel } from "../components";
import { AddIcon, CopyIcon, DeleteIcon } from "../icons";
import { Copy, Scenario } from "../model";

export const ScenarioOverview = () => {
  const [isLoading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const loadScenarios = async () => {
    try {
      const scs = await api.getScenarios();
      setScenarios(scs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadScenarios();
  }, []);

  const onDelete = async (scenario: Scenario) => {
    setLoading(true);
    await api.deleteScenario(scenario.id);
    loadScenarios();
  };

  const onCopy = async (scenario: Scenario) => {
    setLoading(true);
    const copy = Copy.ofScenario(scenario);
    copy.name = `${copy.name} - Copy`;
    await api.putScenario(copy);
    loadScenarios();
  };

  if (isLoading) {
    return <ProgressPanel />;
  }

  scenarios.sort((s1, s2) => s1.name.localeCompare(s2.name));

  return (
    <>
      <p>
        <strong>Scenarios</strong>
      </p>
      <ScenarioTable scenarios={scenarios} onCopy={onCopy} onDelete={onDelete} />
    </>
  );
};

const ScenarioTable = ({
  scenarios,
  onCopy,
  onDelete,
}: {
  scenarios: Scenario[];
  onCopy: (scenario: Scenario) => void;
  onDelete: (scenario: Scenario) => void;
}) => {
  const navigate = useNavigate();

  if (scenarios.length === 0) {
    return (
      <p>No scenarios available yet. <Link to="/ui/scenarios/edit">
        Create your first scenarion.</Link>
      </p>
    );
  }

  const rows = scenarios.map((scenario, index) => (
    <tr key={scenario.id}>
      <td>{index + 1}</td>
      <td>
        <Link to={`/ui/scenarios/edit/${scenario.id}`}>
          {scenario.name}
        </Link>
      </td>
      <td>
        <div>
          <CopyIcon
            onClick={() => onCopy(scenario)}
            tooltip="Copy this scenario"
          />
          {' | '}
          <DeleteIcon
            onClick={() => onDelete(scenario)}
            tooltip="Delete this scenario"
          />
        </div>
      </td>
    </tr>
  ));

  return (
    <table>
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Scenario</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
      <tr>
        <td>
          <AddIcon
            tooltip="Create a new scenario"
            onClick={() => {
              navigate('/ui/scenarios/edit');
            }}
          />
        </td>
        <td />
        <td />
      </tr>
    </table>
  );
};
