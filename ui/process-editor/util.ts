import { TreatmentStep } from "../model";

type StepHolder = {
  id: string;
  steps?: TreatmentStep[];
}

export function parentOf(
  step: TreatmentStep, parent: StepHolder
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
