import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminDeliveryPage() {
  const adminPath = process.env.ADMIN_PATH || 'admin';
  redirect(`/${adminPath}/dashboard/shipping`);
}
