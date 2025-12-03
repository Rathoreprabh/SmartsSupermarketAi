import { NextRequest, NextResponse } from 'next/server';
import { searchProductImage } from '@/lib/unsplash/client';

export async function POST(request: NextRequest) {
  try {
    const { productName } = await request.json();

    if (!productName) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    const imageUrl = await searchProductImage(productName);

    if (imageUrl) {
      return NextResponse.json({
        success: true,
        imageUrl,
      });
    } else {
      return NextResponse.json(
        { error: 'No image found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Error searching image:', error);
    return NextResponse.json(
      { error: 'Failed to search image' },
      { status: 500 }
    );
  }
}