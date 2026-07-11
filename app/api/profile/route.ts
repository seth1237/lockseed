import { z } from 'zod';
import { requireAuth, jsonError } from '@/lib/api/helpers';
import { updateUserProfile, changeUserPassword } from '@/lib/services/auth.service';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function GET() {
  const { user, error } = await requireAuth();
  if (error || !user) return error!;

  const { sanitizeUser } = await import('@/lib/services/auth.service');
  return Response.json({ user: sanitizeUser(user) });
}

export async function PUT(request: Request) {
  const { user, error } = await requireAuth();
  if (error || !user) return error!;

  try {
    const body = updateSchema.parse(await request.json());
    const updated = await updateUserProfile(user._id.toString(), body);
    return Response.json({ user: updated });
  } catch (err) {
    if (err instanceof z.ZodError) return jsonError('Invalid profile data');
    return jsonError(err instanceof Error ? err.message : 'Update failed');
  }
}

export async function PATCH(request: Request) {
  const { user, error } = await requireAuth();
  if (error || !user) return error!;

  try {
    const body = passwordSchema.parse(await request.json());
    await changeUserPassword(user._id.toString(), body.currentPassword, body.newPassword);
    return Response.json({ success: true });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Password change failed');
  }
}
