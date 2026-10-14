import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { SupplierLead } from '@/lib/models/SupplierLead';
import { getAdminSession, serializeLead } from '@/lib/admin/session';
import { jsonError } from '@/lib/api/helpers';

const schema = z.object({
  status: z.enum(['new', 'reviewing', 'accepted', 'rejected']),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminSession())) {
    return jsonError('Unauthorized', 401);
  }

  try {
    const { id } = await context.params;
    const body = schema.parse(await request.json());
    await connectDB();

    const lead = await SupplierLead.findByIdAndUpdate(
      id,
      { $set: { status: body.status } },
      { new: true }
    ).lean();

    if (!lead) {
      return jsonError('Lead not found', 404);
    }

    return NextResponse.json({ lead: serializeLead(lead as never) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || 'Invalid input');
    }
    return jsonError(error instanceof Error ? error.message : 'Update failed', 500);
  }
}
