const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/retail-magik', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Database connected"))
    .catch(err => console.error("MongoDB connection error", err));

// Product Schema and Model
const productSchema = new mongoose.Schema({
    title: String,
    price: Number,
    image: String,
    category: String,
    description: String
});

const Product = mongoose.model('Product', productSchema);

// Cart Schema and Model
const cartSchema = new mongoose.Schema({
    userId: String,
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title: String,
        price: Number,
        image: String,
        quantity: Number
    }],
    total: Number
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

// Search Endpoint
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: "Search query is required" });
        }

        const results = await Product.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        }).limit(20); // Limit results to prevent overloading

        res.json(results);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Cart Endpoints
app.get('/api/cart', async (req, res) => {
    try {
        const sessionId = req.headers['session-id'] || 'guest';
        let cart = await Cart.findOne({ userId: sessionId })
            .populate('items.productId', 'title price image');

        if (!cart) {
            cart = new Cart({
                userId: sessionId,
                items: [],
                total: 0
            });
            await cart.save();
        }

        res.json(cart);
    } catch (error) {
        console.error("Get cart error:", error);
        res.status(500).json({ error: "Failed to retrieve cart" });
    }
});

app.post('/api/cart/items', async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const sessionId = req.headers['session-id'] || 'guest';

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        let cart = await Cart.findOne({ userId: sessionId });
        if (!cart) {
            cart = new Cart({ userId: sessionId, items: [], total: 0 });
        }

        // Check if item exists
        const existingItem = cart.items.find(item =>
            item.productId.toString() === productId.toString()
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                productId,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity
            });
        }

        // Update total
        cart.total = cart.items.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        );

        await cart.save();
        res.json(await cart.populate('items.productId', 'title price image'));
    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({ error: "Failed to add item to cart" });
    }
});

app.delete('/api/cart/items/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const sessionId = req.headers['session-id'] || 'guest';

        const cart = await Cart.findOne({ userId: sessionId });
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        // Remove item
        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId
        );

        // Update total
        cart.total = cart.items.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        );

        await cart.save();
        res.json(await cart.populate('items.productId', 'title price image'));
    } catch (error) {
        console.error("Remove from cart error:", error);
        res.status(500).json({ error: "Failed to remove item from cart" });
    }
});

// Clear entire cart
app.delete('/api/cart', async (req, res) => {
    try {
        const sessionId = req.headers['session-id'] || 'guest';
        await Cart.deleteOne({ userId: sessionId });
        res.json({ message: "Cart cleared successfully" });
    } catch (error) {
        console.error("Clear cart error:", error);
        res.status(500).json({ error: "Failed to clear cart" });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
