/**
 * AI credits — project-level balance and deduction.
 * Stub implementation: in-memory per project; replace with DB in production.
 */

const projectCredits = new Map<string, number>();

const DEFAULT_CREDITS = 1000;

export function getCredits(projectId: string): number {
    const current = projectCredits.get(projectId);
    if (current !== undefined) return current;
    projectCredits.set(projectId, DEFAULT_CREDITS);
    return DEFAULT_CREDITS;
}

export function deductCredits(
    projectId: string,
    amount: number
): { success: boolean; remaining: number } {
    const current = getCredits(projectId);
    if (current < amount) {
        return { success: false, remaining: current };
    }
    const remaining = current - amount;
    projectCredits.set(projectId, remaining);
    return { success: true, remaining };
}

/**
 * For tests: set a project's credit balance.
 */
export function setCredits(projectId: string, amount: number): void {
    projectCredits.set(projectId, amount);
}
