import { requireUser } from '@/lib/auth-server';
import { Sidebar } from '@/components/sidebar/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser('/dashboard');
  const isAdmin = user?.role === 'ADMINISTRATION';

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background md:flex-row">
      <Sidebar username={user.username} role={user.role} isAdmin={isAdmin} />
      <section className="w-full min-w-0 flex-1 p-4 sm:p-6 lg:px-8">{children}</section>
    </div>
  );
}
