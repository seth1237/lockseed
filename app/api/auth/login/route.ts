import { NextResponse } from 'next/server';
import { z } from 'zod';
import { loginUser } from '@/lib/services/auth.service';
import { jsonError } from '@/lib/api/helpers';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const ip = request.headers.get('x-forwarded-for') || undefined;
    const user = await loginUser(body.email, body.password, { ipAddress: ip });
    return NextResponse.json({ user, success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError('Invalid email or password');
    }
    return jsonError('Invalid email or password', 401);
  }
}
