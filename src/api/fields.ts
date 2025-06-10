import { FieldSchema } from '../types/Field.js';

import { loadFields as loaderLoadFields } from '../loaders/loadFields.js';

export function listFields(project?: string): Record<string, FieldSchema> {
    return loaderLoadFields();
}
