import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { ZodError, ZodType } from 'zod';

const validationTargetByMetadataType: Record<string, string> = {
  body: 'Body',
  custom: 'Request',
  param: 'Route params',
  query: 'Query params',
};

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    try {
      return this.schema.parse(value);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const validationTarget =
          validationTargetByMetadataType[metadata.type] ?? 'Request';

        throw new BadRequestException({
          error: 'Bad Request',
          message: `${validationTarget} validation failed`,
          errors: error.issues.map((issue) => ({
            code: issue.code,
            message: issue.message,
            path: issue.path.join('.') || metadata.data || metadata.type,
          })),
        });
      }

      throw error;
    }
  }
}

export const zodPipe = (schema: ZodType): ZodValidationPipe =>
  new ZodValidationPipe(schema);
