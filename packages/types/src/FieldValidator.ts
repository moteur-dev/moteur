import { ValidationResult } from './ValidationResult';
import { FieldSchema } from './Field';

export type FieldValidator = (value: any, fieldSchema: FieldSchema) => ValidationResult;
