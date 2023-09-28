import * as uuid from "uuid";
import {
  Component,
  Fraction,
  Product,
  Scenario,
  FractionState,
  ScenarioStep,
  findParentComponent,
} from "../model";

type StepHolder = {
  id: string;
  steps?: ScenarioStep[];
}

export function parentOf(
  step: ScenarioStep, parent: StepHolder
): [StepHolder, number] | null {
  if (!step || !parent || !parent.steps) {
    return null;
  }
  for (let i = 0; i < parent.steps.length; i++) {
    const child = parent.steps[i];
    if (child.id === step.id) {
      return [parent, i];
    }
    const sub = parentOf(step, child);
    if (sub) {
      return sub;
    }
  }
  return null;
}

export function labelOf(comp: Component, product: Product): string {
  if (!comp.isMaterial) {
    const p = findParentComponent(comp, product);
    return p
      ? `${comp.name} (${p[0].name})`
      : comp.name || "";
  }
  let p: [Component, number] | null = [comp, -1];
  while (p && p[0].isMaterial) {
    p = findParentComponent(p[0], product)
  }
  if (!p) {
    return comp.name || "";
  }
  return `${comp.name} (${p[0].name})`;
}

export function listFractions(t: Scenario, step: ScenarioStep): Fraction[] {

  // TODO: filter only fractions that are still available in this step using
  // parent and sibling relations
  const product = t.product;
  if (!product) {
    return [];
  }

  const fractions: Fraction[] = [];
  function collect(component: Component) {
    fractions.push({
      id: uuid.v4(),
      component,
      state: FractionState.PassThrough,
      value: 100,
    })
    component.parts?.forEach(collect);
  }
  collect(product);
  fractions.sort((f1, f2) => {
    const n1 = f1.component?.name || "";
    const n2 = f2.component?.name || "";
    return n1.localeCompare(n2);
  });

  return fractions;
}
