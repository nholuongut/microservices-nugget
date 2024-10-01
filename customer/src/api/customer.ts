import { Express } from "express";
import CustomerService from "../services/customerService";
import { CustomRequest } from "../types/api/customRequest.types";
import userAuth from "./middlewares/auth";
import { Channel } from "amqplib";
import { PublishMessage } from "../utils";
import config from "../config";

const { SHOPPING_SERVICE } = config;

export default (app: Express, channel: Channel) => {
  const service = new CustomerService();

  app.post("/signup", async (req, res, next) => {
    try {
      const { email, password, phone } = req.body;
      const data = await service.SignUp({ email, password, phone });
      return res.json(data);
    } catch (error) {
      next(error);
    }
  });

  app.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const data = await service.SignIn({ email, password });
      return res.json(data);
    } catch (error) {
      next(error);
    }
  });

  app.post("/address", userAuth, async (req, res, next) => {
    try {
      const { _id } = (req as CustomRequest).user;
      const { street, postalCode, city, country } = req.body;
      const data = await service.AddNewAddress(_id, {
        street,
        postalCode,
        city,
        country,
      });
      return res.json(data);
    } catch (error) {
      next(error);
    }
  });

  app.get("/profile", userAuth, async (req, res, next) => {
    try {
      const { _id } = (req as CustomRequest).user;
      const data = await service.GetProfile(_id);
      return res.json(data);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/profile", userAuth, async (req, res, next) => {
    try {
      const { _id } = (req as CustomRequest).user;
      const { data, payload } = await service.DeleteProfile(_id);
      // Send message to Shopping Service for removing cart & wishlist
      PublishMessage(channel, SHOPPING_SERVICE, JSON.stringify(payload));
      return res.json(data);
    } catch (error) {
      next(error);
    }
  });

  app.get("/whoami", (req, res) => {
    return res.status(200).json({ msg: "/customer : I am Customer Service" });
  });
};
