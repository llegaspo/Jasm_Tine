import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class RejectClientUserIdPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (
      metadata.type === 'body' &&
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.prototype.hasOwnProperty.call(value, 'user_id')
    ) {
      throw new BadRequestException({
        message: 'user_id is managed by the server and cannot be provided.',
      });
    }

    return value;
  }
}
