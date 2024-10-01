import { Request } from "express";
import jwt from "jsonwebtoken";

export interface CustomRequest extends Request {
    user: jwt.JwtPayload;
  }