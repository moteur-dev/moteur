import fs from 'fs';
import readline from 'readline';

export async function resolveInputData(flags: {
    file?: string;
    data?: string;
    interactiveFields?: string[];
}): Promise<Record<string, any>> {
    if (flags.file) {
        return JSON.parse(fs.readFileSync(flags.file, 'utf-8'));
    }

    if (flags.data) {
        return JSON.parse(flags.data);
    }

    // Interactive mode
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const prompt = (q: string) => new Promise<string>(res => rl.question(q, a => res(a)));

    const result: Record<string, string> = {};
    for (const field of flags.interactiveFields ?? []) {
        result[field] = await prompt(`${field}: `);
    }

    rl.close();
    return result;
}
