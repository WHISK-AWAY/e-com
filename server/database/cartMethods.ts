import Product from './Product';
import { ICart, TCartReturn, TProduct } from './dbTypes';

export async function addToCart(
  this: ICart & { parent?(): any },
  productId: string,
  qty: number
): Promise<TCartReturn | null> {
  // look up the product by id
  // compare add qty to qty available on product doc
  // if we're trying to add too many --- add only as many as we have, and notify (?)
  if (!qty || qty < 1) return null;

  const prod = await Product.findById(productId);
  if (!prod) return null;

  if (!this.products || this.products.length === 0) {
    // if cart has no products, initialize it as an empty array so we're safe to push into it later
    this.products = [];
  }

  const addToCart = {
    product: prod.id,
    price: prod.price,
    qty: Math.min(prod.qty, qty), // lesser of requested & available
  };

  if (addToCart.qty === 0) return null;

  const existingProducts: string[] = this.products.map((prod: TProduct) =>
    prod.product.toString()
  );

  if (existingProducts.includes(productId)) {
    // cart already includes product
    for (let prod of this.products) {
      if (prod.product.toString() === productId) {
        prod.qty += addToCart.qty;
        break;
      }
    }
  } else {
    // cart doesn't already include product
    this.products.push(addToCart);
  }

  await prod.updateOne({ $inc: { qty: -addToCart.qty } }).exec();
  await this.parent!().save(); //balls

  return {
    productId: prod.id,
    productName: prod.productName,
    qtyAdded: addToCart.qty,
  };
}
