import { NextResponse } from 'next/server';
import { z } from 'zod';
import { registerUser } from '@/lib/services/auth.service';
import { jsonError } from '@/lib/api/helpers';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const user = await registerUser(body);
    return NextResponse.json({ user, success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || 'Invalid input');
    }
    const message = error instanceof Error ? error.message : 'Registration failed';
    return jsonError(message, message.includes('already') ? 409 : 400);
  }
}
