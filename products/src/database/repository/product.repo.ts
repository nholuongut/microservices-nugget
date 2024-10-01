import { PrismaClient, Prisma } from '@prisma/client';
import { ProductInterface } from '../../types/product/productInputs.types';

const prisma = new PrismaClient();

class ProductRepository {
  async CreateProduct({
    name,
    desc,
    type,
    unit,
    price,
    available,
    suplier: supplier,
    banner,
  }: ProductInterface) {
    const product = await prisma.product.create({
      data: {
        name,
        desc,
        type,
        unit,
        price,
        available,
        supplier,
        banner,
      },
    });
    return product;
  }

  async Products() {
    return await prisma.product.findMany();
  }

  async FindById(id: string) {
    return await prisma.product.findUnique({
      where: {
        id,
      },
    });
  }

  async FindByCategory(category: string) {
    const products = await prisma.product.findMany({
      where: {
        type: category,
      },
    });

    return products;
  }

  async FindSelectedProducts(selectedIds: string[]) {
    return await prisma.product.findMany({
      where: {
        id: {
          in: selectedIds,
        },
      },
    });
  }
}

export default ProductRepository;
