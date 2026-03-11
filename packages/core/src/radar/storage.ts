import type { RadarViolation, RadarReport } from '@moteur/types/Radar.js';
import { getProjectStorage } from '../utils/getProjectStorage.js';
import { getJson, putJson } from '../utils/storageAdapterUtils.js';
import { RADAR_KEY } from '../utils/storageKeys.js';

export async function loadRadarReport(projectId: string): Promise<RadarReport | null> {
    const storage = getProjectStorage(projectId);
    const report = await getJson<RadarReport>(storage, RADAR_KEY);
    return report ?? null;
}

export async function saveRadarReport(projectId: string, report: RadarReport): Promise<void> {
    const storage = getProjectStorage(projectId);
    await putJson(storage, RADAR_KEY, report);
}

export function computeSummary(violations: RadarViolation[]): RadarReport['summary'] {
    let errors = 0;
    let warnings = 0;
    let suggestions = 0;
    for (const v of violations) {
        if (v.severity === 'error') errors++;
        else if (v.severity === 'warning') warnings++;
        else suggestions++;
    }
    return {
        errors,
        warnings,
        suggestions,
        total: violations.length
    };
}
