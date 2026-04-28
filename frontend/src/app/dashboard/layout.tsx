import { SideBar } from '@/components/SideBar';
import { DashboardUserMenu } from '@/components/DashboardUserMenu';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-surface min-h-screen px-4 md:px-0 py-5 md:py-8">
      <div className="max-w-[1440px] mx-auto space-y-5 md:space-y-6">
        <header className="border border-outline-variant bg-surface-container-low px-5 md:px-8 py-4 md:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Panel Interno</p>
            <h1 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase mt-1">
              Radiadores Amazona
            </h1>
          </div>

          <DashboardUserMenu />
        </header>

        <div className="md:grid md:grid-cols-[260px_1fr] md:gap-0 border border-outline-variant bg-surface-container-low">
          <SideBar />
          <main className="pb-10 md:p-8 lg:p-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
