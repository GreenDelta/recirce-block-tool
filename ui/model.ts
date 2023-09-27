export interface User {
  id: string;
  name: string;
}

export interface Credentials {
  user: string;
  password: string;
}

export interface Component {
  id: string;
  name: string;
  mass: number;
  isMaterial: boolean;
  parts?: Component[];
}

export interface Product extends Component {
}

export interface Material {
  name: string;
  parent: string;
}

export interface Process {
  id: string;
  name: string;
  emissionFactor: number;
}

export interface Treatment {
  id: string;
  name: string;
  product?: Product;
  steps?: TreatmentStep[];
}

export interface TreatmentStep {
  id: string;
  process?: string;
  fractions?: Fraction[];
  steps?: TreatmentStep[];
}

export interface Fraction {
  id: string;
  component: Component;
  state: TreatmentState;
  value: number;
}

/**
  * PassThrough represents the state where the material is passed through to the
  * next step without being recycled or disposed of.
  * Recycled represents the state where the material is recycled for further use.
  * Disposed represents the state where the material is disposed of or discarded.
 */
export enum TreatmentState {
  PassThrough = "Pass through",
  Recycled = "Recycled",
  Disposed = "Disposed",
}

export function findParentComponent(
  comp: Component, root: Component
): [Component, number] | null {
  if (!comp || !root || !root.parts) {
    return null;
  }
  for (let i = 0; i < root.parts.length; i++) {
    const child = root.parts[i];
    if (child.id === comp.id) {
      return [root, i];
    }
    const sub = findParentComponent(comp, child);
    if (sub) {
      return sub;
    }
  }
  return null;
}
