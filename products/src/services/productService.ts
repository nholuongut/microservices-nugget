import ProductRepository from '../database/repository/product.repo';
import { ProductInterface } from '../types/product/productInputs.types';
import { FormateData } from '../utils';

// All Business logic will be here
class ProductService {
  repository: ProductRepository;
  constructor() {
    this.repository = new ProductRepository();
  }

  async CreateProduct(productInputs: ProductInterface) {
    const productResult = await this.repository.CreateProduct(productInputs);
    return FormateData(productResult);
  }

  async GetProducts() {
    const products = await this.repository.Products();

    return FormateData({
      products,
      categories: Object.keys(products.map(({ type }: {type: string}) => type)),
    });
  }

  async GetProductDescription(productId: string) {
    const product = await this.repository.FindById(productId);
    return FormateData(product);
  }

  async GetProductsByCategory(category: string) {
    const products = await this.repository.FindByCategory(category);
    return FormateData(products);
  }

  async GetSelectedProducts(selectedIds: string[]) {
    const products = await this.repository.FindSelectedProducts(selectedIds);
    return FormateData(products);
  }

  async GetProductPayload(
    userId: string,
    { productId, qty }: { productId: string; qty: number },
    event: string,
  ) {
    const product = await this.repository.FindById(productId);

    if (product) {
      const payload = {
        event: event,
        data: { userId, product, qty },
      };

      return FormateData(payload);
    } else {
      return FormateData({ error: 'No product Available' });
    }
  }

  // RPC Response
  async serveRPCRequest(payload: any) {
      const { type, data } = payload;
      switch (type) {
        case "VIEW_PRODUCT":
          return this.repository.FindById(data);
          break;
        case "VIEW_PRODUCTS":
          return this.repository.FindSelectedProducts(data);
        default:
          break;
      }
    }
}

export default ProductService;
