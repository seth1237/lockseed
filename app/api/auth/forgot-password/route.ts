import { z } from 'zod';
import { requestPasswordReset } from '@/lib/services/auth.service';
import { jsonError } from '@/lib/api/helpers';

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    await requestPasswordReset(body.email);
    return Response.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    });
  } catch {
    return jsonError('Invalid email');
  }
}
