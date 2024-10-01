import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { CartModel, OrderModel, WishlistModel } from '../models';
import {
  CartInterface,
  ProductInterface,
} from '../../types/shopping/shoppingInputs.types';

//Dealing with data base operations
class ShoppingRepository {
  // Cart
  async Cart(customerId: string) {
    return CartModel.findOne({ customerId });
  }

  async ManageCart(
    product: ProductInterface,
    { customerId, qty, isRemove }: CartInterface,
  ) {
    const cart = await CartModel.findOne({ customerId });
    if (cart) {
      if (isRemove) {
        const cartItems = _.filter(
          cart.items,
          (item) => item.product?._id !== product._id,
        );
        cart.items = cartItems;
        // handle remove case
      } else {
        const cartIndex = _.findIndex(cart.items, {
          product: { _id: product._id },
        });
        if (cartIndex > -1) {
          cart.items[cartIndex].unit = qty;
        } else {
          cart.items.push({ product: { ...product }, unit: qty });
        }
      }
      return await cart.save();
    } else {
      // create a new one
      return await CartModel.create({
        customerId,
        items: [{ product: { ...product }, unit: qty }],
      });
    }
  }

  async ManageWishlist(
    customerId: string,
    product_id: string,
    isRemove = false,
  ) {
    const wishlist = await WishlistModel.findOne({ customerId });
    if (wishlist) {
      if (isRemove) {
        const produtcs = _.filter(
          wishlist.products,
          (product) => product._id !== product_id,
        );
        wishlist.products = produtcs;
        // handle remove case
      } else {
        const wishlistIndex = _.findIndex(wishlist.products, {
          _id: product_id,
        });
        if (wishlistIndex < 0) {
          wishlist.products.push({ _id: product_id });
        }
      }
      return await wishlist.save();
    } else {
      // create a new one
      return await WishlistModel.create({
        customerId,
        wishlist: [{ _id: product_id }],
      });
    }
  }

  async GetWishlistByCustomerId(customerId: string) {
    return WishlistModel.findOne({ customerId });
  }

  async Orders(customerId: string, orderId: string) {
    if (orderId) {
      return OrderModel.findOne({ _id: orderId });
    } else {
      return OrderModel.find({ customerId });
    }
  }

  async CreateNewOrder(customerId: string) {
    const cart = await CartModel.findOne({ customerId: customerId });

    if (cart) {
      let amount = 0;

      const cartItems = cart.items;

      if (cartItems.length > 0) {
        //process Order

        cartItems.map((item) => {
          amount += (item.product?.price || 0) * (item.unit || 0);
        });

        const orderId = uuidv4();

        const order = new OrderModel({
          orderId,
          customerId,
          amount,
          status: 'received',
          items: cartItems,
        });

        cart.items = [];

        const orderResult = await order.save();
        await cart.save();
        return orderResult;
      }
    }

    return {};
  }

  async deleteProfileData(customerId: string) {
    return Promise.all([
      CartModel.findOneAndDelete({ customerId }),
      WishlistModel.findOneAndDelete({ customerId }),
    ]);
  }
}

export default ShoppingRepository;
