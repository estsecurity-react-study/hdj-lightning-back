import { Request } from 'express';

export interface PassportRequest<T> extends Request {
  user: T;
}
