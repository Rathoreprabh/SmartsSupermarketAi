import { supabaseAdmin } from '@/lib/supabase/admin';
import { Product } from '@/types/product';

/**
 * SERVER-SIDE ONLY
 * Fetch all products from Supabase
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data?.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : undefined,
      image: product.image,
      category: product.category,
      rating: product.rating,
      reviews: product.reviews,
      in_stock: product.in_stock,
      stock_quantity: product.stock_quantity,
    })) || [];
  } catch (error) {
    console.error('Error in getProducts:', error);
    return [];
  }
}

/**
 * SERVER-SIDE ONLY
 * Fetch single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      original_price: data.original_price ? parseFloat(data.original_price) : undefined,
      image: data.image,
      category: data.category,
      rating: data.rating,
      reviews: data.reviews,
      in_stock: data.in_stock,
      stock_quantity: data.stock_quantity,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}