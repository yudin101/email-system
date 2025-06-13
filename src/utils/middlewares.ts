import { Request, Response, NextFunction } from "express";

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(`${req.method} - ${req.url}`);
  next();
};

export const checkLogin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }

  next();
};
