import { NextResponse } from 'next/server';

import { Chat } from '@/models';
import dbConnect from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(request: Request) {
    const session = await auth()
    console.log(session);
    
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  await dbConnect();

  const chats = await Chat.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .select('title createdAt');

  revalidatePath('/api/chats');

  return NextResponse.json(chats);
}