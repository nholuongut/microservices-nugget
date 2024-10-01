import ShoppingRepository from '../database/repository/shopping.repositoy';
import {
  CartInterface,
  ProductInterface,
} from '../types/shopping/shoppingInputs.types';
import { FormateData, RPCRequest } from '../utils';

// All Business logic will be here
class ShoppingService {
  repository: ShoppingRepository;

  constructor() {
    this.repository = new ShoppingRepository();
  }

  // Cart Info
  async AddCartItem(
    customerId: string,
    product_id: string,
    qty: number | undefined,
  ) {
    // Grab product info from product Service through RPC
    const productResponse = (await RPCRequest('PRODUCT_RPC', {
      type: 'VIEW_PRODUCT',
      data: product_id,
    })) as ProductInterface;
    if (productResponse) {
      const data = await this.repository.ManageCart(productResponse, {
        customerId,
        qty,
      });
      return { data };
    }
    throw new Error('Product data not found!');
  }

  async RemoveCartItem(customerId: string, product_id: string) {
    return await this.repository.ManageCart(
      { _id: product_id },
      {
        customerId,
        qty: 0,
        isRemove: true,
      },
    );
  }

  async GetCart(_id: string) {
    return this.repository.Cart(_id);
  }

  // Wishlist
  async AddToWishlist(customerId: string, product_id: string) {
    return this.repository.ManageWishlist(customerId, product_id);
  }

  async RemoveFromWishlist(customerId: string, product_id: string) {
    return this.repository.ManageWishlist(customerId, product_id, true);
  }

  async GetWishlist(customerId: string) {
    const wishlist = await this.repository.GetWishlistByCustomerId(customerId);
    if (!wishlist) {
      return {};
    }
    const { products } = wishlist;

    if (Array.isArray(products)) {
      const ids = products.map(({ _id }) => _id);
      // Perform RPC call
      const productResponse = await RPCRequest('PRODUCT_RPC', {
        type: 'VIEW_PRODUCTS',
        data: ids,
      });
      if (productResponse) {
        return productResponse;
      }
    }

    return wishlist;
  }

  // Orders
  async CreateOrder(customerId: string) {
    return this.repository.CreateNewOrder(customerId);
  }

  async GetOrder(orderId: string) {
    return this.repository.Orders('', orderId);
  }

  async GetOrders(customerId: string) {
    return this.repository.Orders(customerId, '');
  }

  async ManageCart(
    item: ProductInterface,
    { customerId, qty, isRemove }: CartInterface,
  ) {
    const cartResult = await this.AddCartItem(customerId, item._id, qty);
    return FormateData(cartResult);
  }

  async SubscribeEvents(payload: string) {
    const parsedPayload = JSON.parse(payload);
    const { event, data } = parsedPayload;
    const { userId: customerId, product, qty } = data;
    let isRemove: boolean;

    switch (event) {
      case 'ADD_TO_CART':
        isRemove = false;
        this.ManageCart(product, { customerId, qty, isRemove } as unknown as {
          customerId: string;
          qty: number;
          isRemove: boolean;
        });
        break;
      case 'REMOVE_FROM_CART':
        isRemove = true;
        this.ManageCart(product, { customerId, qty, isRemove } as unknown as {
          customerId: string;
          qty: number;
          isRemove: boolean;
        });
        break;
      case 'DELETE_PROFILE':
        await this.deleteProfileData(data.userId);
        break;
      default:
        break;
    }
  }

  async deleteProfileData(customerId: string) {
    return this.repository.deleteProfileData(customerId);
  }

  // async GetOrderPayload(userId: string, order: string, event) {
  //   if (order) {
  //     const payload = {
  //       event: event,
  //       data: { userId, order },
  //     };

  //     return payload;
  //   } else {
  //     return FormateData({ error: "No Order Available" });
  //   }
  // }
}

export default ShoppingService;
