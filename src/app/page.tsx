import { listFiles } from './actions';
import { Dashboard } from '@/components/Dashboard';

export const dynamic = 'force-dynamic';

export default async function Page() {
    const files = await listFiles();
    return <Dashboard files={files} />;
}
