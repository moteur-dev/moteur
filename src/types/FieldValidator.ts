import { ValidationResult } from './ValidationResult.js';
import { FieldSchema } from './Field.js';

export type FieldValidator = (value: any, fieldSchema: FieldSchema) => ValidationResult;
