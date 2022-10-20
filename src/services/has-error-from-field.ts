import { ZodError } from 'zod';

export const hasErrorFromField = (err: ZodError, fieldName: string) =>
  !!err.issues.find(({ path }) => path.includes(fieldName));

export default hasErrorFromField;
