import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { CustomResponseException } from './custom-response.exception';

@Catch(CustomResponseException)
export class CustomResponseFilter implements ExceptionFilter {
  catch(e: CustomResponseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (e.redirectUrl) {
      response.redirectUrl(e.redirectUrl);
    }

    if (e.customData) {
      if (e.headers) {
        response.setHeader('Content-Type', 'text/html');
        response.write(e.customData);
      }
    }
    response.end();
  }
}
