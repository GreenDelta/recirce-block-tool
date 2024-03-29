import * as uuid from "uuid";

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

export interface Scenario {
  id: string;
  name: string;
  product?: Product;
  steps?: ScenarioStep[];
}

export interface ScenarioStep {
  id: string;
  process?: string;
  fractions?: Fraction[];
  steps?: ScenarioStep[];
}

export interface Fraction {
  id: string;
  component?: Component;
  state: FractionState;
  value: number;
}

export enum FractionState {
  Disposed = "Disposed",
  PassedThrough = "Passed through",
  Recycled = "Recycled",
  Reused = "Reused",
}

export interface Analysis {
  id: string;
  name: string;
  baseline?: string;
  scenarios?: Scenario[];
}

export interface Result {
  analysis: Analysis;
  wasteResults: WasteResult[];
  emissionResults: EmissionResult[];
}

export interface WasteResult {
  scenario: string;
  amountDisposed: number;
  amountRecycled: number;
  amountReused: number;
}

export interface EmissionResult {
  scenario: string;
  value: number;
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

export function nextPartMassOf(comp: Component): number {
  let mass = comp?.mass || 0;
  if (mass <= 0) {
    return 0;
  }
  if (comp.parts) {
    for (const part of comp.parts) {
      const partMass = part.mass || 0;
      mass -= partMass;
    }
  }
  return mass <= 0 ? 0 : mass;
}

export class Copy {

  static ofProduct(p: Product): Product {
    const copy =  Copy.ofComponent(p);
    copy.id = uuid.v4();
    return copy;
  }

  private static ofComponent(c: Component): Component {
    const copy: Component = {
      id: c.id,
      name: c.name,
      mass: c.mass,
      isMaterial: c.isMaterial,
    };
    if (c.parts) {
      copy.parts = c.parts.map(Copy.ofComponent);
    }
    return copy;
  }

  static ofScenario(s: Scenario): Scenario {
    const copy: Scenario = {
      id: uuid.v4(),
      name: s.name,
    };
    if (s.product) {
      copy.product = Copy.ofComponent(s.product);
    }
    if (s.steps) {
      copy.steps = s.steps.map(Copy.ofScenarioStep);
    }
    return copy;
  }

  private static ofScenarioStep(step: ScenarioStep): ScenarioStep {
    const copy: ScenarioStep = {
      id: step.id,
    };
    if (step.process) {
      copy.process = step.process;
    }
    if (step.fractions) {
      copy.fractions = step.fractions.map(Copy.ofFraction);
    }
    if (step.steps) {
      copy.steps = step.steps.map(Copy.ofScenarioStep);
    }
    return copy;
  }

  private static ofFraction(fraction: Fraction): Fraction {
    const copy: Fraction = {
      id: uuid.v4(),
      state: fraction.state,
      value: fraction.value,
    };
    if (fraction.component) {
      copy.component = Copy.ofComponent(fraction.component);
    }
    return copy;
  }

  static ofAnalysis(a: Analysis): Analysis {
    const copy: Analysis = {
      id: uuid.v4(),
      name: a.name,
      baseline: a.baseline,
    };
    if (a.scenarios) {
      copy.scenarios = a.scenarios.map(Copy.ofScenario);
    }
    return copy;
  }
}
