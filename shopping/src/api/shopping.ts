import { Express } from 'express';
import ShoppingService from '../services/shooppingService';
import userAuth from './middlewares/auth';
import { CustomRequest } from '../types/api/customRequest.types';
import { Channel } from 'amqplib';
import { SubscribeMessage } from '../utils';

export default (app: Express, channel: Channel) => {
  const service = new ShoppingService();

  SubscribeMessage(channel, service);

  // Cart
  app.post('/cart', userAuth, async (req, res) => {
    try {
      const { _id } = (req as CustomRequest).user;
      console.log(_id, req.body);
      const { product_id, qty } = req.body;
      const { data } = await service.AddCartItem(_id, product_id, qty);
      res.status(200).json(data);
    } catch (err) {
      return res.status(404).json(err);
    }
  });

  app.delete('/cart/:id', userAuth, async (req, res) => {
    try {
      const { _id } = (req as CustomRequest).user;
      const productId = req.params.id;
      const data = await service.RemoveCartItem(_id, productId);
      res.status(200).json(data);
    } catch (err) {
      return res.status(404).json(err);
    }
  });

  app.get('/cart', userAuth, async (req, res) => {
    try {
      const { _id } = (req as CustomRequest).user;
      const data = await service.GetCart(_id);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(404).json(err);
    }
  });

  // Wishlist
  app.post('/wishlist', userAuth, async (req, res) => {
    try {
      const { _id } = (req as CustomRequest).user;
      const { product_id } = req.body;
      const data = await service.AddToWishlist(_id, product_id);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(404).json(err);
    }
  });
  app.get('/wishlist', userAuth, async (req, res) => {
    try {
      const { _id } = (req as CustomRequest).user;
      const data = await service.GetWishlist(_id);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(404).json(err);
    }
  });
  app.delete('/wishlist/:id', userAuth, async (req, res) => {
    try {
      const { _id } = (req as CustomRequest).user;
      const product_id = req.params.id;
      const data = await service.RemoveFromWishlist(_id, product_id);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(404).json(err);
    }
  });

  // Orders
  app.post('/order', userAuth, async (req, res) => {
    try {
      const { _id } = (req as CustomRequest).user;
      // const { txnNumber } = req.body;
      const data = await service.CreateOrder(_id);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(404).json(err);
    }
  });

  app.get('/order/:id', userAuth, async (req, res) => {
    try {
      const { _id } = (req as CustomRequest).user;
      const data = await service.GetOrder(_id);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(404).json(err);
    }
  });

  app.get('/orders', userAuth, async (req, res) => {
    try {
      const { _id } = (req as CustomRequest).user;
      const data = await service.GetOrders(_id);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(404).json(err);
    }
  });

  app.get('/whoami', (req, res) => {
    return res.status(200).json({ msg: '/shoping : I am Shopping Service' });
  });
};
