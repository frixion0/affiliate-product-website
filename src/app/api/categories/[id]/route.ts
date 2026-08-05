import { NextRequest, NextResponse } from 'next/server';
import { ghUpdateJSON } from '@/lib/github';

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await ghUpdateJSON<Category[]>('data/categories.json', (categories) => {
      if (!categories.some((c) => c.id === id)) {
        throw new Error('Category not found');
      }
      return categories.filter((c) => c.id !== id);
    }, `Delete category: ${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Category not found') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
