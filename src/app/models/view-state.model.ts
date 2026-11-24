import { Product } from './product.model';

export interface ViewState {
  loading: boolean;
  error: string;
  products: Product[];
}
