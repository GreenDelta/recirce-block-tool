export interface ProductPart {
  id: string
  name: string;
  mass: number;
}

export interface Component extends ProductPart{
  components?: Component[];
  materials?: ProductPart[];
}

export interface Product extends Component {
  id: string
}
