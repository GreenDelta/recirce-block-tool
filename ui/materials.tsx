import React, { useState, useEffect } from "react";
import { Material } from "./model";
import * as api from "./api";
import { ProgressPanel } from "./components";
import { AddIcon, DeleteIcon } from "./icons";

export const MaterialsPage = () => {

  const [materials, setMaterials] = useState<Material[] | null>(null);

  useEffect(() => {
    api.getMaterials().then(setMaterials);
  }, []);

  if (!materials) {
    return <ProgressPanel message="Get materials from server..." />;
  }

  const onAdd = async (mat: Material) => {
    setMaterials(null);
    await api.putMaterial(mat);
    const next = await api.getMaterials();
    setMaterials(next);
  };

  materials.sort((m1, m2) => {
    if (!m1.name || !m2.name) {
      return 0;
    }
    return m1.name.localeCompare(m2.name);
  });
  const rows = [];
  for (let i = 0; i < materials.length; i++) {
    const mat = materials[i];
    rows.push(
      <tr>
        <td>{i + 1}</td>
        <td>{mat.name}</td>
        <td>{mat.parent || "Material"}</td>
        <td>
          <DeleteIcon tooltip="Delete this material" />
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
            <th scope="col">Material</th>
            <th scope="col">Is a</th>
            <th scope="col" />
          </tr>
        </thead>
        <tbody>
          {rows}
          <AddRow onAdd={(mat) => onAdd(mat)} />
        </tbody>
      </table>
    </>
  );
};

const AddRow = ({ onAdd }: { onAdd: (material: Material) => void }) => {
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const inputStyle = { marginBottom: 0 };
  return (
    <tr>
      <td>
        <AddIcon tooltip="Add a material"
          onClick={() => {
            if (!name) {
              return;
            }
            onAdd({ name, parent });
            setName("");
            setParent("");
          }} />
      </td>
      <td>
        <input type="text" style={inputStyle} required
          placeholder="Material name"
          value={name}
          onChange={e => setName(e.target.value)} />
      </td>
      <td>
        <input type="text" style={inputStyle}
          placeholder="More generic material"
          value={parent}
          onChange={e => setParent(e.target.value)} />
      </td>
      <td></td>
    </tr>
  );
};
