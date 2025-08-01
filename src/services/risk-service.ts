import { RISK_EVENTS } from '@/constants/data';
import type { RiskEvent } from '@/types/risk';

export async function getRiskEvents(): Promise<RiskEvent[]> {
    // Data is now sourced directly from the constants file.
    // The sorting ensures a consistent order.
    const sortedEvents = [...RISK_EVENTS].sort((a, b) => a.name.localeCompare(b.name));
    return Promise.resolve(sortedEvents);
}
