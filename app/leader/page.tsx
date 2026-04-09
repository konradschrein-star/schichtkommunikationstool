import ShiftLeaderView from '@/components/views/ShiftLeaderView';
import { RoleLayout } from '@/components/layout/RoleLayout';

export default function LeaderPage() {
  return (
    <RoleLayout role="leader" currentView="dashboard">
      <ShiftLeaderView />
    </RoleLayout>
  );
}
