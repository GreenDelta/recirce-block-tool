export interface User {
  id: string;
  name: string;
}

export interface Credentials {
  user: string;
  password: string;
}

export interface ProductPart {
  id: string;
  mass: number;
  materials?: MaterialPart[];
}

export interface MaterialPart extends ProductPart {
  material: string;
}

export interface Component extends ProductPart {
  name: string;
  components?: Component[];
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
  energyDemand?: number;
  input?: Flow;
  output?: Flow;
  steps?: ProcessStep[];
}

export interface Flow {
  materials?: MaterialPart[];
  components?: Component[];
}
