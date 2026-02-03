import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const responseBody = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR, // Default status code
      message: 'Something went wrong', // Default message
      result: null,
      error: null,
      isEncrypted: false,
    };

    if (exception instanceof BadRequestException) {
      const { message, error, isEncrypted } = exception.getResponse() as any;
      responseBody.statusCode = HttpStatus.BAD_REQUEST;
      responseBody.message = message;
      responseBody.error = error;
      responseBody.isEncrypted = isEncrypted || false;
    } else if (exception instanceof NotFoundException) {
      const { message, error, isEncrypted } = exception.getResponse() as any;
      responseBody.statusCode = HttpStatus.NOT_FOUND;
      responseBody.message = message;
      responseBody.error = error;
      responseBody.isEncrypted = isEncrypted || false;
    } else if (exception instanceof UnauthorizedException) {
      const { message, error, isEncrypted } = exception.getResponse() as any;
      responseBody.statusCode = HttpStatus.UNAUTHORIZED;
      responseBody.message = message;
      responseBody.error = error;
      responseBody.isEncrypted = isEncrypted || false;
    } else if (exception instanceof ForbiddenException) {
      const { message, error, isEncrypted } = exception.getResponse() as any;
      responseBody.statusCode = HttpStatus.FORBIDDEN;
      responseBody.message = 'Access denied';
      responseBody.error = error;
      responseBody.isEncrypted = isEncrypted || false;
    } else if (exception.response) {
      responseBody.statusCode = exception.response.statusCode;
      responseBody.error = exception.response.error;
      responseBody.message = exception.response.message;
    } else {
      console.log('Unknown error >>>', exception);
      responseBody.message = 'Something went wrong';
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, responseBody.statusCode);
  }
}
