import { FieldSchema } from '../types/Field';

import { loadFields as loaderLoadFields } from '../loaders/loadFields';

export function listFields(project?: string): Record<string, FieldSchema> {
    return loaderLoadFields();
}
