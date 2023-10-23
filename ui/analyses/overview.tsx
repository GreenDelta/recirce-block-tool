import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as api from "../api";
import { ProgressPanel } from "../components";
import { AddIcon, CopyIcon, DeleteIcon } from "../icons";
import { Copy, Analysis } from "../model";

export const AnalysesOverview = () => {
  const [isLoading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  const loadAnalyses = async () => {
    try {
      const analyses = await api.getAnalyses();
      setAnalyses(analyses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadAnalyses();
  }, []);

  const onDelete = async (analysis: Analysis) => {
    setLoading(true);
    await api.deleteAnalysis(analysis.id);
    loadAnalyses();
  };

  const onCopy = async (analysis: Analysis) => {
    setLoading(true);
    const copy = Copy.ofAnalysis(analysis);
    copy.name = `${copy.name} - Copy`;
    await api.putAnalysis(copy);
    loadAnalyses();
  };

  if (isLoading) {
    return <ProgressPanel />;
  }

  analyses.sort((a1, a2) => a1.name.localeCompare(a2.name));

  return (
    <>
      <p>
        <strong>Analyses</strong>
      </p>
      <AnalysisTable analyses={analyses} onCopy={onCopy} onDelete={onDelete} />
    </>
  );
};

const AnalysisTable = ({
  analyses,
  onCopy,
  onDelete,
}: {
  analyses: Analysis[];
  onCopy: (analysis: Analysis) => void;
  onDelete: (analysis: Analysis) => void;
}) => {
  const navigate = useNavigate();

  if (analyses.length === 0) {
    return (
      <p>No analyses available yet. <Link to="/ui/analyses/edit">
        Create your first analysis.</Link>
      </p>
    );
  }

  const rows = analyses.map((analysis, index) => (
    <tr key={analysis.id}>
      <td>{index + 1}</td>
      <td>
        <Link to={`/ui/analyses/edit/${analysis.id}`}>
          {analysis.name}
        </Link>
      </td>
      <td>
        <div>
          <CopyIcon
            onClick={() => onCopy(analysis)}
            tooltip="Copy this analysis"
          />
          {' | '}
          <DeleteIcon
            onClick={() => onDelete(analysis)}
            tooltip="Delete this analysis"
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
          <th scope="col">Analysis</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
      <tr>
        <td>
          <AddIcon
            tooltip="Create a new analysis"
            onClick={() => {
              navigate('/ui/analyses/edit');
            }}
          />
        </td>
        <td />
        <td />
      </tr>
    </table>
  );
};
