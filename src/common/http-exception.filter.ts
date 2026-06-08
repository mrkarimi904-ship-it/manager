import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { extractErrorMessage } from './error.util';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: { status: boolean; data: null; error: string; msg: string } = {
      status: false,
      data: null,
      error: 'Internal server error',
      msg: 'Internal server error',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null && 'status' in (res as object)) {
        const shaped = res as { status?: boolean; data?: null; error?: unknown; msg?: unknown };
        const errorText = typeof shaped.error === 'string' ? shaped.error : extractErrorMessage(shaped.error);
        const msgText = typeof shaped.msg === 'string' ? shaped.msg : (errorText || extractErrorMessage(res));
        body = {
          status: shaped.status === true,
          data: null,
          error: errorText || msgText,
          msg: msgText || errorText,
        };
      } else {
        const msg = extractErrorMessage(res);
        body = { status: false, data: null, error: msg, msg };
      }
    } else {
      const msg = extractErrorMessage(exception);
      body = { status: false, data: null, error: msg, msg };
    }

    response.status(status).json(body);
  }
}
