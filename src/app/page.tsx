import { Dashboard } from '@/components/Dashboard';
import { StorageProviderWrapper } from '@/context/StorageContext';

export const dynamic = 'force-dynamic';

export default async function Page() {
    return (
        <StorageProviderWrapper>
            <Dashboard />
        </StorageProviderWrapper>
    );
}
