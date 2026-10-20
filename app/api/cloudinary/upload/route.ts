import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { uploadImageToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const directUrl = formData.get('url') as string | null;

    if (directUrl) {
      return NextResponse.json({
        url: directUrl,
        secureUrl: directUrl,
        publicId: `ext-${Date.now()}`,
      });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds maximum allowed 8MB' }, { status: 400 });
    }

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    if (isCloudinaryConfigured) {
      const uploadResult = await uploadImageToCloudinary(base64Data, 'kawish-mooi-products');
      return NextResponse.json({
        url: uploadResult.url,
        secureUrl: uploadResult.secureUrl,
        publicId: uploadResult.publicId,
      });
    } else {
      // If Cloudinary keys are not yet provided in the environment, return a data URI representation
      // so admin testing works seamlessly without blocking product creation
      return NextResponse.json({
        url: base64Data,
        secureUrl: base64Data,
        publicId: `local-${Date.now()}`,
        notice: 'Uploaded locally (Cloudinary environment credentials not yet configured).',
      });
    }
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ error: error.message || 'Image upload failed' }, { status: 500 });
  }
}
