import { z } from 'zod';
import { zCuid, zDateString, zDecimal } from './validation/zod-schemas';

export { zDecimal };

export const zId = zCuid;
export const zDate = zDateString;
export const zPositiveNumber = z.number().positive('Must be a positive number');
