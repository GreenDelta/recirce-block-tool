import React, { useState, useEffect } from "react";
import { Material } from "./model";
import * as api from "./api";
import { ProgressPage } from "./progress";
import { MainMenu } from "./menu";

export const MaterialsPage = () => {

  const [materials, setMaterials] = useState<Material[] | null>(null);

  useEffect(() => {
    api.getMaterials().then(setMaterials);
  }, []);

  if (!materials) {
    return <ProgressPage message="Get materials from server..." />;
  }

  materials.sort((m1, m2) => {
    if (!m1.name || !m2.name) {
      return 0;
    }
    return m1.name.localeCompare(m2.name);
  });

  const index: Record<string, Material> = {};
  for (const mat of materials) {
    index[mat.id] = mat;
  }

  const rows = [];
  for (let i = 0; i < materials.length; i++) {
    const mat = materials[i];
    let parent = "Material";
    if (mat.parent) {
      const p = index[mat.parent];
      if (p) {
        parent = p.name;
      }
    }
    rows.push(
      <tr>
        <th>{i + 1}</th>
        <th>{mat.name}</th>
        <th>{parent}</th>
      </tr>
    );
  }

  return (
    <>
      <MainMenu />
      <table>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Material</th>
            <th scope="col">Is a</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </>
  );
};
