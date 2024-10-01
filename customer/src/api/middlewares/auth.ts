import { NextFunction, Request, Response } from "express";
import { ValidateSignature } from "../../utils";
import { AuthorizeError } from "../../utils/errors/app-errors";

const userAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAuthorized = await ValidateSignature(req);

    if (isAuthorized) {
      return next();
    }
    throw new AuthorizeError("not authorised to access resources");
  } catch (error) {
    next(error);
  }
};

export default userAuth;