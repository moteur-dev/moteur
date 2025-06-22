import fieldRegistry from '@moteur/core/registry/FieldRegistry';

export async function listFieldsCommand(args: { json?: boolean; quiet?: boolean }) {
    const fields = fieldRegistry.all();
    if (args.json) {
        console.log(JSON.stringify(fields, null, 2));
    } else if (!args.quiet) {
        console.log(`🧩 Available field types:`);
        Object.values(fields).forEach(field => {
            console.log(`- ${field.type} \t (${field.label}) \t\t - ${field.description})`);
        });
    }
}
