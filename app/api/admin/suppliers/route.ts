import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { SupplierLead } from '@/lib/models/SupplierLead';
import { getAdminSession, serializeLead } from '@/lib/admin/session';
import { jsonError } from '@/lib/api/helpers';

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return jsonError('Unauthorized', 401);
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const filter =
      status && ['new', 'reviewing', 'accepted', 'rejected'].includes(status)
        ? { status }
        : {};

    const leads = await SupplierLead.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ leads: leads.map((l) => serializeLead(l as never)) });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to load leads', 500);
  }
}
