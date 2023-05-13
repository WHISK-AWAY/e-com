import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env ' });
const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;
import Product from './Product';
import { ICart, IUser, TCartReturn, TProduct } from './dbTypes';

export async function hashPassword(this: IUser) {
  // if(this.password.length > 20 || this.password.length < 8) throw new Error('Do not meet max password length requirement')
  this.password = await bcrypt.hash(this.password, +SALT_ROUNDS!);
}

export async function hashUpdatedPassword(
  this: IUser & { getUpdate(): IUser },
  next: any
) {
  console.log(this.getUpdate());
  const updatePassword = this.getUpdate() as IUser;

  if (!updatePassword?.password) return next();
  else
    updatePassword.password = await bcrypt.hash(
      updatePassword.password,
      +SALT_ROUNDS!
    );
  // console.log(Object.keys(updatePassword));
}

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

export async function removeFromCart(
  this: ICart & { parent?(): any },
  productId: string,
  qty?: number
): Promise<void> {
  // productId = productId.toString();
  try {
    // const productsInCart: string[] = this.products.map((prod: TProduct) => prod.product.toString());
    const productToRemove: TProduct | undefined = this.products.find(
      (prod: TProduct) => prod.product.toString() === productId.toString()
    );
    if (!productToRemove) {
      console.log('no productToRemove');
      return;
    }

    const inventoryProduct = await Product.findById(productId);
    if (!inventoryProduct) {
      console.log('no inventoryProduct');
      return;
    }

    // remove whole item if qty is not provided
    if (!qty) qty = productToRemove.qty;

    // remove the lesser of passed-in qty & qty in cart
    const qtyToRemove = Math.min(qty, productToRemove.qty);

    // add removed qty back to inventory
    inventoryProduct.qty += qtyToRemove;
    await inventoryProduct.save();

    // remove either requested qty or entire product
    if (qty === productToRemove.qty) {
      this.products = this.products.filter(
        (prod: TProduct) => prod.product.toString() !== productId.toString()
      );
    } else {
      for (let prod of this.products) {
        if (prod.product.toString() === productId.toString()) {
          prod.qty -= qtyToRemove;
          break;
        }
      }
    }

    await this.parent!().save();
  } catch (err) {
    console.log(err);
  }
}

export async function clearCart(
  this: ICart & { parent?(): any },
  options: { restock: boolean } = { restock: false }
): Promise<void> {
  if (options.restock) {
    const cartProducts = this.products;
    while (cartProducts.length) {
      const prod = cartProducts.pop()!;
      await Product.findByIdAndUpdate(prod.product, {
        $inc: { qty: prod.qty },
      });
      // console.log(`returning qty ${prod.qty} of ${prod.id}`)
    }
  }
  await this.parent!().updateOne({ $set: { 'cart.products': [] } });
}

export function cartSubtotal(this: ICart) {
  let tot = 0;

  if (!this.products) return tot;

  for (let prod of this.products) {
    tot += prod.price * prod.qty;
  }

  return +tot.toFixed(2);
}
