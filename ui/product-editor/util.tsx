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
