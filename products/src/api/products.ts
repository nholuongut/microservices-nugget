import { Express } from 'express';
import ProductService from '../services/productService';
import { ProductInterface } from '../types/product/productInputs.types';
import { RPCObserver } from '../utils';
import { Channel } from 'amqplib';

export default (app: Express, channel: Channel) => {
  const service = new ProductService();

  RPCObserver('PRODUCT_RPC', service, channel);

  app.post('/create', async (req, res) => {
    const { name, desc, type, unit, price, available, suplier, banner } =
      req.body;
    try {
      // validation
      const { data } = await service.CreateProduct({
        name,
        desc,
        type,
        unit,
        price,
        available,
        suplier,
        banner,
      } as ProductInterface);
      return res.json(data);
    } catch (err) {
      return res.status(404).json({ err });
    }
  });

  app.get('/category/:type', async (req, res) => {
    const type = req.params.type;
    try {
      const { data } = await service.GetProductsByCategory(type);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.get('/:id', async (req, res) => {
    const productId = req.params.id;

    try {
      const { data } = await service.GetProductDescription(productId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.post('/ids', async (req, res) => {
    const { ids } = req.body;
    try {
      const products = await service.GetSelectedProducts(ids);
      return res.status(200).json(products);
    } catch (err) {
      return res.status(404).json({ err });
    }
  });

  app.get('/whoami', (req, res) => {
    return res
      .status(200)
      .json({ msg: '/ or /products : I am products Service' });
  });

  //get Top products and category
  app.get('/', async (req, res) => {
    //check validation
    try {
      const { data } = await service.GetProducts();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });
};
