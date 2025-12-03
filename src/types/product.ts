export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  in_stock: boolean;
  stock_quantity: number;
  quantity?: number;
}