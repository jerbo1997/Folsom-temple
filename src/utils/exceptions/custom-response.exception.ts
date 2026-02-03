// redirection.exception.ts
import { NotFoundException } from '@nestjs/common';

export class CustomResponseException extends NotFoundException {
  readonly customData: string;
  readonly redirectUrl: string;
  readonly headers: Record<string, string>;

  constructor(
    message: string,
    // redirectUrl?: string,
    customData?: string,
    headers?: Record<string, string>,
  ) {
    super(message);
    this.customData = customData;
    // this.redirectUrl = redirectUrl;
    this.headers = headers;
  }
}
