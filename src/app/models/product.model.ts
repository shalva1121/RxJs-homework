export interface Product {
  id: number;
  name: string;
  price: number;
  nuts: boolean;
  vegeterian: boolean;
  spiciness: number;
  image?: string;
  category?: { name?: string };
}
