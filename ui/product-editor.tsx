import React, { useState, useEffect } from "react";
import { MainMenu } from "./menu";
import { Component, Product, ProductPart } from "./model";
import * as api from "./api";
import * as uuid from "uuid";
import { ProgressPage } from "./progress";

export const ProductEditor = () => {
  const [materials, setMaterials] = useState<string[] | null>(null);

  const [product, setProduct] = useState<Product>({
    id: uuid.v4(),
    name: "New product",
    mass: 1.0,
  });

  useEffect(() => {
    api.getMaterials().then(mats => {
      const names = mats.map(m => m.name).sort();
      setMaterials(names);
    });
  }, []);
  if (!materials) {
    return <ProgressPage message="Loading materials..." />;
  }

  return (
    <>
      <MainMenu />
      <p>
        <strong>Create a new product</strong>
      </p>
      <datalist id="materials">
        {materials.map(m => <option value={m} />)}
      </datalist>
      <ComponentPanel
        key={product.id}
        isRoot
        product={product}
        materials={materials}
        component={product}
        onChanged={() => setProduct({ ...product })}
        onSave={() => api.postProduct(product)}
      />
    </>
  );
};

interface CompProps {
  isRoot?: boolean;
  component: Component;
  product: Product;
  materials: string[];
  onChanged: () => void;
  onSave: () => void;
}

interface MatProps {
  material: ProductPart;
  product: Product;
  materials: string[];
  onChanged: () => void;
}

const ComponentPanel = (props: CompProps) => {
  const comp = props.component;

  const subComps = [];
  if (comp.components) {
    for (const c of comp.components) {
      const subProps = { ...props, component: c, isRoot: false };
      subComps.push(<ComponentPanel key={c.id} {...subProps} />);
    }
  }

  const matParts = [];
  if (comp.materials) {
    for (const mat of comp.materials) {
      matParts.push(
        <MaterialPanel
          key={mat.id}
          material={mat}
          product={props.product}
          materials={props.materials}
          onChanged={props.onChanged}
        />
      );
    }
  }

  return (
    <>
      <article style={{ margin: "3px", paddingBottom: "15px" }}>
        <header style={{ padding: "15px", marginBottom: "15px" }}>
          <div className="grid">
            <div>
              <input
                type="text"
                value={comp.name}
                onChange={(e) => {
                  comp.name = e.target.value;
                  props.onChanged();
                }}
              />
            </div>
            <div style={{ display: "inline-flex" }}>
              <input
                type="number"
                value={comp.mass}
                onChange={(e) => {
                  const s = e.target.value;
                  if (s) {
                    comp.mass = Number.parseFloat(s);
                  }
                  props.onChanged();
                }}
              />
              <label style={{ padding: 15 }}>kg</label>
            </div>
          </div>
        </header>
        <CompMenu {...props} />
        {subComps}
        {matParts}
      </article>
    </>
  );
};

const CompMenu = (props: CompProps) => {
  const onAddComp = () => {
    const sub = {
      id: uuid.v4(),
      name: "New component",
      mass: 1.0,
    };
    const c = props.component;
    if (c.components) {
      c.components.push(sub);
    } else {
      c.components = [sub];
    }
    props.onChanged();
  };

  const onAddMat = () => {
    const mat = {
      id: uuid.v4(),
      material: "",
      mass: 1.0,
    };
    const c = props.component;
    if (c.materials) {
      c.materials.push(mat);
    } else {
      c.materials = [mat];
    }
    props.onChanged();
  };

  const onDelete = () => {
    const t = parentOf(props.component, props.product);
    if (!t) {
      return;
    }
    const [parent, idx] = t;
    if (parent.components && idx >= 0) {
      parent.components.splice(idx, 1);
      props.onChanged();
    }
  };

  const links = [
    <PanelLink onClick={onAddComp} label="Add component" sep />,
    <PanelLink onClick={onAddMat} label="Add material" sep />,
  ];
  if (props.isRoot) {
    links.push(<PanelLink onClick={props.onSave} label="Save product" />);
  } else {
    links.push(<PanelLink onClick={onDelete} label="Delete component" />);
  }

  const massFraction = props.isRoot ? (
    <></>
  ) : (
    massFractionOf(props.component, props.product)
  );

  return (
    <nav>
      <ul>{massFraction}</ul>
      <ul>{links}</ul>
    </nav>
  );
};

const MaterialPanel = (props: MatProps) => {
  const onDelete = () => {};

  return (
    <article style={{ margin: "3px", paddingBottom: "15px" }}>
      <header style={{ padding: "15px", marginBottom: "15px" }}>
        <div className="grid">
          <input list="materials" />
          <div style={{ display: "inline-flex" }}>
            <input type="number" value={props.material.mass} />
            <label style={{ padding: 15 }}>kg</label>
          </div>
        </div>
      </header>
      <nav>
        <ul></ul>
        <ul>
          <PanelLink onClick={onDelete} label="Delete material" />
        </ul>
      </nav>
    </article>
  );
};

function parentOf(
  comp: Component,
  root: Component
): [Component, number] | null {
  if (!comp || !root || !root.components) {
    return null;
  }
  for (let i = 0; i < root.components.length; i++) {
    const child = root.components[i];
    if (child.id === comp.id) {
      return [root, i];
    }
    const sub = parentOf(comp, child);
    if (sub) {
      return sub;
    }
  }
  return null;
}

function massFractionOf(elem: ProductPart, product: Product) {
  const style: React.CSSProperties = { fontSize: "0.8em" };
  let share;
  if (product.mass <= 0 || elem.mass < 0) {
    style.color = "red";
    share = "NaN";
  } else {
    const val = (100 * elem.mass) / product.mass;
    share = val.toFixed(2);
    if (val > 100) {
      style.color = "red";
    }
  }
  return (
    <li>
      Mass fraction: <span style={style}>{share}</span>
    </li>
  );
}

const PanelLink = ({
  onClick,
  label,
  sep,
}: {
  onClick: () => void;
  label: string;
  sep?: boolean;
}) => {
  const link = (
    <li>
      <a onClick={onClick} style={{ cursor: "pointer", fontSize: "0.8em" }}>
        {label}
      </a>
    </li>
  );
  return sep ? (
    <>
      {link} <li>|</li>
    </>
  ) : (
    link
  );
};
