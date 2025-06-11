import { listFields } from '../../../src/api/fields';

export async function listFieldsCommand(args: { json?: boolean; quiet?: boolean }) {
    const fields = listFields();
    if (args.json) {
        console.log(JSON.stringify(fields, null, 2));
    } else if (!args.quiet) {
        console.log(`🧩 Available field types:`);
        Object.values(fields).forEach(field => {
            console.log(`- ${field.type} \t (${field.label}) \t\t - ${field.description})`);
        });
    }
}
