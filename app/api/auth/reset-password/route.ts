import { z } from 'zod';
import { resetPasswordWithToken } from '@/lib/services/auth.service';
import { jsonError } from '@/lib/api/helpers';

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    await resetPasswordWithToken(body.token, body.password);
    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Reset failed';
    return jsonError(message);
  }
}
