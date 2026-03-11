import { cliRegistry } from '@moteur/core/registry/CommandRegistry.js';
import { cliLoadUser } from '../utils/auth.js';
import { projectSelectPrompt } from '../utils/projectSelectPrompt.js';
import {
    loadRadarReport,
    runFullScan
} from '@moteur/core/radar/index.js';
import type { RadarViolation } from '@moteur/types/Radar.js';

export async function radarCommand(args: {
    projectId?: string;
    project?: string;
    severity?: string;
    model?: string;
    format?: string;
    scan?: boolean | string;
}) {
    const user = cliLoadUser();
    const projectId = (args.projectId ?? args.project) as string | undefined;
    const resolvedProjectId = projectId ?? (await projectSelectPrompt(user));
    if (!resolvedProjectId) {
        console.error('❌ Project is required. Use --projectId= or --project=.');
        return;
    }

    const doScan = args.scan === true || args.scan === 'true' || args.scan === '1';
    const report = doScan
        ? await runFullScan(resolvedProjectId, { source: 'studio' })
        : await loadRadarReport(resolvedProjectId);

    if (!report) {
        if (doScan) {
            console.log('⊙ Moteur Radar —', resolvedProjectId);
            console.log('Scanned: just now\nNo violations.');
        } else {
            console.log('⊙ No Radar data yet. Run with --scan to run a full scan.');
        }
        return;
    }

    let violations = report.violations;
    const severity = args.severity as string | undefined;
    if (severity && ['error', 'warning', 'suggestion'].includes(severity)) {
        violations = violations.filter(v => v.severity === severity);
    }
    const model = args.model as string | undefined;
    if (model) {
        violations = violations.filter(v => v.modelSlug === model);
    }

    const format = (args.format ?? 'table') as string;
    if (format === 'json') {
        const summary = {
            errors: violations.filter(v => v.severity === 'error').length,
            warnings: violations.filter(v => v.severity === 'warning').length,
            suggestions: violations.filter(v => v.severity === 'suggestion').length,
            total: violations.length
        };
        console.log(
            JSON.stringify(
                {
                    scannedAt: report.scannedAt,
                    summary,
                    violations
                },
                null,
                2
            )
        );
        return;
    }

    // Table output
    console.log('⊙ Moteur Radar —', resolvedProjectId);
    console.log('Scanned:', report.scannedAt);
    console.log('');

    const bySeverity = (s: 'error' | 'warning' | 'suggestion') =>
        violations.filter(v => v.severity === s);
    const errors = bySeverity('error');
    const warnings = bySeverity('warning');
    const suggestions = bySeverity('suggestion');

    if (errors.length > 0) {
        console.log('ERRORS (' + errors.length + ')');
        errors.forEach(v => printViolation(v));
        console.log('');
    }
    if (warnings.length > 0) {
        console.log('WARNINGS (' + warnings.length + ')');
        warnings.forEach(v => printViolation(v));
        console.log('');
    }
    if (suggestions.length > 0) {
        console.log('SUGGESTIONS (' + suggestions.length + ')');
        suggestions.forEach(v => printViolation(v));
        console.log('');
    }

    console.log(
        `${errors.length} errors · ${warnings.length} warnings · ${suggestions.length} suggestions`
    );
}

function printViolation(v: RadarViolation) {
    const loc = v.locale ? ` / ${v.locale}` : '';
    const field = v.fieldPath ? ` / ${v.fieldPath}` : '';
    console.log(`  ${v.ruleId.padEnd(28)} ${v.modelSlug} / ${v.entrySlug}${field}${loc}`);
}

cliRegistry.register('radar', {
    name: '',
    description: 'Show Radar violations (content health). Use --scan to run a full scan, --format=json for JSON.',
    action: radarCommand
});
