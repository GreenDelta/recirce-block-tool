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
  component: Component;
  isRecycled: false;
  value: number;
}
