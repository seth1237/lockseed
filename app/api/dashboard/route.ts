import { requireAuth } from '@/lib/api/helpers';
import { getUserDashboard } from '@/lib/services/quote.service';
import { sanitizeUser } from '@/lib/services/auth.service';

export async function GET() {
  const { user, error } = await requireAuth();
  if (error || !user) return error!;

  const dashboard = await getUserDashboard(user._id.toString());
  return Response.json({
    user: sanitizeUser(user),
    ...dashboard,
  });
}
