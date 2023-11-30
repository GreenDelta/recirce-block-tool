import React, { useState, useEffect } from "react";
import { Process } from "./model";
import * as api from "./api";
import { ProgressPanel } from "./components";
import { AddIcon, DeleteIcon } from "./icons";
import * as uuid from "uuid";

export const ProcessesPage = () => {

  const [processes, setProcesses] = useState<Process[] | null>(null);
  useEffect(() => {
    api.getProcesses().then(setProcesses);
  }, []);

  if (!processes) {
    return <ProgressPanel message="Get processes from server..." />;
  }

  const onAdd = async (p: Process) => {
    setProcesses(null);
    await api.putProcess(p);
    const next = await api.getProcesses();
    setProcesses(next);
  };

  const onDelete = async (p: Process) => {
    setProcesses(null);
    await api.deleteProcess(p.id);
    const next = await api.getProcesses();
    setProcesses(next);
  };

  processes.sort((p1, p2) => {
    if (!p1.name || !p2.name) {
      return 0;
    }
    return p1.name.localeCompare(p2.name);
  });

  const rows = [];
  for (let i = 0; i < processes.length; i++) {
    const p = processes[i];
    rows.push(
      <tr>
        <td>{i + 1}</td>
        <td>{p.name}</td>
        <td>{p.emissionFactor}</td>
        <td>
          <DeleteIcon tooltip="Delete this process" onClick={() => onDelete(p)} />
        </td>
      </tr>
    );
  }

  return (
    <>
      <table>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Process</th>
            <th scope="col">Emission factor [CO2 eq. / kg]</th>
            <th scope="col" />
          </tr>
        </thead>
        <tbody>
          {rows}
          <AddRow onAdd={(p) => onAdd(p)} />
        </tbody>
      </table>
    </>
  );
};



const AddRow = ({ onAdd }: { onAdd: (p: Process) => void }) => {
  const [name, setName] = useState("");
  const [factor, setFactor] = useState(0);
  const inputStyle = { marginBottom: 0 };
  return (
    <tr>
      <td>
        <AddIcon tooltip="Add a process"
          onClick={() => {
            if (!name) {
              return;
            }
            onAdd({
              id: uuid.v4(),
              name: name,
              emissionFactor: factor,
            });
            setName("");
            setFactor(0);
          }} />
      </td>
      <td>
        <input type="text" style={inputStyle} required
          placeholder="Process name"
          value={name}
          onChange={e => setName(e.target.value)} />
      </td>
      <td>
        <input type="number" style={inputStyle}
          value={factor}
          onChange={e => setFactor(Number.parseFloat(e.target.value))} />
      </td>
      <td></td>
    </tr>
  );
};
