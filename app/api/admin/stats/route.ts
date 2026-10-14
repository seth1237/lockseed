import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { SupplierLead } from '@/lib/models/SupplierLead';
import { getAdminSession } from '@/lib/admin/session';
import { jsonError } from '@/lib/api/helpers';

export async function GET() {
  if (!(await getAdminSession())) {
    return jsonError('Unauthorized', 401);
  }

  try {
    await connectDB();
    const [total, newCount, reviewing, accepted, rejected] = await Promise.all([
      SupplierLead.countDocuments(),
      SupplierLead.countDocuments({ status: 'new' }),
      SupplierLead.countDocuments({ status: 'reviewing' }),
      SupplierLead.countDocuments({ status: 'accepted' }),
      SupplierLead.countDocuments({ status: 'rejected' }),
    ]);

    const recent = await SupplierLead.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('companyName contactName status createdAt email')
      .lean();

    return NextResponse.json({
      stats: { total, new: newCount, reviewing, accepted, rejected },
      recent: recent.map((r) => ({
        id: r._id.toString(),
        companyName: r.companyName,
        contactName: r.contactName,
        email: r.email,
        status: r.status,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to load stats', 500);
  }
}
