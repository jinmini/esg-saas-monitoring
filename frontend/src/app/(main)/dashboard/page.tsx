import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResourceSection } from '@/components/features/dashboard/ResourceSection';
import { DashboardBentoGrid } from '@/components/features/dashboard/DashboardCard';
import { DashboardHero } from '@/components/features/dashboard/DashboardHero';
import { getAllResources } from '@/lib/mdx';

export default async function DashboardPage() {
  const resources = await getAllResources();

  return (
    <DashboardLayout>

      {/* Hero: Full Width */}
      <DashboardHero />

      {/* Content: Constrained Width */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full py-12">
        <DashboardBentoGrid />
        <ResourceSection initialResources={resources} />
      </div>

    </DashboardLayout>
  );
}