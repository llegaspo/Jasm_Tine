import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type ErrorResponse = {
  error?: string;
  errors?: unknown;
  message?: unknown;
  statusCode?: number;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const normalized = this.normalizeExceptionResponse(
      exceptionResponse,
      statusCode,
    );

    response.status(statusCode).json({
      statusCode,
      error: normalized.error,
      message: normalized.message,
      ...(normalized.errors ? { errors: normalized.errors } : {}),
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
  }

  private normalizeExceptionResponse(
    exceptionResponse: string | object | undefined,
    statusCode: number,
  ): Required<Pick<ErrorResponse, 'error' | 'message'>> &
    Pick<ErrorResponse, 'errors'> {
    if (typeof exceptionResponse === 'string') {
      return {
        error: this.defaultError(statusCode),
        message: exceptionResponse,
      };
    }

    if (exceptionResponse && typeof exceptionResponse === 'object') {
      const response = exceptionResponse as ErrorResponse;

      return {
        error: response.error ?? this.defaultError(statusCode),
        message: response.message ?? this.defaultError(statusCode),
        errors: response.errors,
      };
    }

    return {
      error: this.defaultError(statusCode),
      message:
        statusCode === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Internal server error'
          : this.defaultError(statusCode),
    };
  }

  private defaultError(statusCode: number): string {
    return HttpStatus[statusCode] ?? 'Error';
  }
}
