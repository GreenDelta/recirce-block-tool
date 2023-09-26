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
  product?: Product;
  steps?: ProcessStep[];
}

export interface ProcessStep {
  id: string;
  name: string;
  energyDemand: number;
  input?: Component[];
  output?: Component[];
  steps?: ProcessStep[];
}
