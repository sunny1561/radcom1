import { NextResponse } from 'next/server';

import { Message } from '@/models';
import dbConnect from '@/lib/mongodb';
import { auth } from '@/auth';

export async function GET(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  await dbConnect();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      const changeStream = Message.watch([
        { $match: { 'fullDocument.chatId': chatId } },
      ]);

      changeStream.on('change', (change) => {
        if (change.operationType === 'insert') {
          sendEvent(change.fullDocument);
        }
      });

      // Keep the connection alive
      const interval = setInterval(() => {
        sendEvent({ type: 'ping' });
      }, 30000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        changeStream.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}