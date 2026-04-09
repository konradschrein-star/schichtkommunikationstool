import WorkerView from '@/components/views/WorkerView';
import { RoleLayout } from '@/components/layout/RoleLayout';

export default function WorkerPage() {
  return (
    <RoleLayout role="worker">
      <WorkerView />
    </RoleLayout>
  );
}
