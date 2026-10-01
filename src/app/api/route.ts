import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(req: Request) {
  try {
    const { filename, contentType } = await req.json();
    const cleanFilename = filename.replace(/\s+/g, '-');
    const fileKey = `${Date.now()}-${cleanFilename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    });

    // Buat tautan upload sementara (berlaku 1 jam)
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const publicDomain = (process.env.R2_PUBLIC_DOMAIN || '').replace(/\/$/, '');
    const fileUrl = `${publicDomain}/${fileKey}`;

    return NextResponse.json({ success: true, uploadUrl, fileUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}