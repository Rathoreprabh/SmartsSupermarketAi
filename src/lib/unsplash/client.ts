import { createApi } from 'unsplash-js';

// Initialize Unsplash client
export const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
});

// Search for product image
export async function searchProductImage(productName: string): Promise<string | null> {
  try {
    console.log('🔍 Searching Unsplash for:', productName);

    const result = await unsplash.search.getPhotos({
      query: productName,
      page: 1,
      perPage: 1,
      orientation: 'squarish',
    });

    if (result.errors) {
      console.error('Unsplash API errors:', result.errors);
      return null;
    }

    const photo = result.response?.results[0];
    if (photo) {
      console.log('✅ Found image:', photo.urls.regular);
      return photo.urls.regular;
    }

    console.log('❌ No image found for:', productName);
    return null;
  } catch (error) {
    console.error('Error searching Unsplash:', error);
    return null;
  }
}

// Get multiple product images
export async function getProductImages(productNames: string[]): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();

  for (const name of productNames) {
    const imageUrl = await searchProductImage(name);
    if (imageUrl) {
      imageMap.set(name, imageUrl);
    }
    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return imageMap;
}