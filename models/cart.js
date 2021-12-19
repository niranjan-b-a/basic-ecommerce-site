module.exports = class Cart{
    static save(product, cart) {
        // console.log(cart)
        if (cart) {
            console.log('yes cart has existing product')
            const existingProductIndex = cart.products.findIndex(p => p.id == product.id);
            console.log('existingproduct :', existingProductIndex);
            if (existingProductIndex >= 0) {
                const existingProduct = cart.products[existingProductIndex];
                existingProduct.quantity += product.quantity
                cart.totalPrice = product.price + cart.totalPrice;
            } else {
                cart.products.push(product);
                cart.totalPrice = product.quantity * product.price +cart.totalPrice;
            }
        } else {
            cart = { products: [], totalPrice: 0 };
            cart.products.push(product);
            cart.totalPrice = product.quantity * product.price;
        }
        return cart
    }
}