export interface CartInterface {
  customerId: string;
  items?: { product: ProductInterface; unit: number }[];
  qty?: number;
  isRemove?: boolean;
}
export interface ProductInterface {
  _id: string;
  name?: string;
  img?: string;
  unit?: number;
  price?: number;
}
