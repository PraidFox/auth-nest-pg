import { NextFunction, Request, Response } from 'express';

export function logMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`, req.headers['user-agent']);
  console.log(`Request...`, req.headers['sec-ch-ua-platform']);
  console.log(`Request...`, req.ip);

  next();
}
