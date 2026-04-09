import BossView from '@/components/views/BossView';
import { RoleLayout } from '@/components/layout/RoleLayout';

export default function BossPage() {
  return (
    <RoleLayout role="boss" currentView="dashboard">
      <BossView />
    </RoleLayout>
  );
}
