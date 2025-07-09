export class FormStateStore {
    private formState = new Map<string, Map<string, string>>();
    // Map<screenId, Map<fieldPath, value>>

    update(screenId: string, fieldPath: string, value: string) {
        if (!screenId || !fieldPath) return;

        if (!this.formState.has(screenId)) {
            this.formState.set(screenId, new Map());
        }
        const state = this.formState.get(screenId)!;
        state.set(fieldPath, value);
    }

    get(screenId: string): Record<string, string> {
        const map = this.formState.get(screenId);
        if (!map) return {};
        return Object.fromEntries(map.entries());
    }

    getField(screenId: string, fieldPath: string): string | undefined {
        return this.formState.get(screenId)?.get(fieldPath);
    }

    clear(screenId: string) {
        this.formState.delete(screenId);
    }

    clearField(screenId: string, fieldPath: string) {
        this.formState.get(screenId)?.delete(fieldPath);
    }

    isDirty(screenId: string): boolean {
        return !!this.formState.get(screenId)?.size;
    }
}

export const formStateStore = new FormStateStore();
