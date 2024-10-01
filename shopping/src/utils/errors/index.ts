import { NextFunction, Request, Response, Express } from "express";
import { ErrorInterface } from "../../types/error/error.types";
import * as Sentry from "@sentry/node";
import { AuthorizeError, NotFoundError, ValidationError } from "./app-errors";
import config from "../../config";

const { SENTRY } = config;

Sentry.init({
  dsn: SENTRY,
  tracesSampleRate: 1.0,
});

export default ((app: Express) => {
  app.use((error: ErrorInterface, req: Request, res: Response, next: NextFunction) => {
    let reportError = true;
    console.log("err");

    // skip common / known errors
    [NotFoundError, ValidationError, AuthorizeError].forEach((typeOfError) => {
      if (error instanceof typeOfError) {
        reportError = false;
      }
    });

    if (reportError) {
      Sentry.captureException(error);
    }

    const statusCode = error.statusCode || 500;
    const data = error.data || error.message;
    return res.status(statusCode).json(data);
  });
});
