import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const prefPath = path.join(process.cwd(), 'data', 'userPreferences.json');

async function readPreferences() {
  try {
    const data = await fs.readFile(prefPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return { favoriteTracks: [], jokes: [] };
  }
}

export async function GET() {
  const prefs = await readPreferences();
  return NextResponse.json(prefs);
}
