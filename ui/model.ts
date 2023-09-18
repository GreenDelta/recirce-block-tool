export interface User {
  name: string;
}

export interface AppState {
  user?: User;
}

export interface ProductPart {
  id: string;
  mass: number;
}

export interface MaterialPart extends ProductPart {
  material: string;
}

export interface Component extends ProductPart {
  name: string;
  components?: Component[];
  materials?: MaterialPart[];
}

export interface Product extends Component {
}

export interface Material {
  name: string;
  parent: string;
}
