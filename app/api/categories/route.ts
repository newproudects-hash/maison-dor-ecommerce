import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/sanity/queries';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (error) {
    console.error('[API/categories] Error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
