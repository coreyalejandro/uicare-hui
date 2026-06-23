import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '@/lib/auth';
import { encrypt, decrypt } from '@/lib/encryption';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileName: string } }
) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const fileName = params.fileName;
  let filePath = path.join(process.cwd(), '../memory-bank', `${fileName}.md`);
  
  // Handle .clinerules file which doesn't have .md extension
  if (fileName === '.clinerules') {
    filePath = path.join(process.cwd(), '../memory-bank', fileName);
  }

  console.log('Attempting to read file:', filePath);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const key = process.env.CONVERSATION_ENCRYPTION_KEY || '';
    const content = key ? decrypt(fileContent, key) : fileContent;
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { fileName: string } }
) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const { content } = await request.json();
  const fileName = params.fileName;
  let filePath = path.join(process.cwd(), '../memory-bank', `${fileName}.md`);
  if (fileName === '.clinerules') {
    filePath = path.join(process.cwd(), '../memory-bank', fileName);
  }

  const key = process.env.CONVERSATION_ENCRYPTION_KEY || '';
  const data = key ? encrypt(content, key) : content;
  fs.writeFileSync(filePath, data, 'utf8');
  return NextResponse.json({ status: 'saved' });
}
