import React, { useState, useEffect } from "react";
import { Material } from "./model";
import * as api from "./api";
import { ProgressPage } from "./progress";

export const MaterialsPage = () => {

  const [materials, setMaterials] = useState<Material[] | null>(null);

  useEffect(() => {
    api.getMaterials().then(setMaterials);
  }, []);

  if (!materials) {
    return <ProgressPage message="Get materials from server..." />;
  }

  const onAdd = async (mat: Material) => {
    setMaterials(null);
    await api.putMaterial(mat);
    const next = await api.getMaterials()
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
        <td><a style={{ cursor: "pointer" }}>Delete</a></td>
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
  return <tr>
    <td>
      <button onClick={() => {
        if (!name) {
          return;
        }
        onAdd({ name, parent });
        setName("");
        setParent("");
      }}>
        Add
      </button>
    </td>
    <td>
      <input type="text"
        placeholder="Material name"
        required
        value={name}
        onChange={e => setName(e.target.value)} />
    </td>
    <td>
      <input type="text"
        placeholder="More generic material"
        value={parent}
        onChange={e => setParent(e.target.value)} />
    </td>
  </tr>
};
