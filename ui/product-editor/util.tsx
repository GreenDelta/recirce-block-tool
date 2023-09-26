import React from "react";
import { Component } from "../model";

export function numOf(
  e: React.ChangeEvent<HTMLInputElement>, f: (n: number) => void
) {
  const s = e?.target?.value;
  if (!s) {
    return;
  }
  try {
    const num = Number.parseFloat(s);
    f(num)
  } catch {
    // nothing
  }
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

export function parentOf(comp: Component, root: Component): [Component, number] | null {
  if (!comp || !root || !root.parts) {
    return null;
  }
  for (let i = 0; i < root.parts.length; i++) {
    const child = root.parts[i];
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
