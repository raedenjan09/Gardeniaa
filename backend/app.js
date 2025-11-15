const express = require('express');
const app = express();
const cors = require('cors')

// ========== CORS CONFIGURATION ==========
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], // Allow all dev ports
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ========== OTHER MIDDLEWARE ==========
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({limit: "50mb", extended: true }));



// ========== ROUTES ==========
const userRoutes = require('./routes/UserRoutes');
const productRoutes = require('./routes/ProductRoutes');
const supplierRoutes = require('./routes/SupplierRoutes');
const manageUserRoutes = require('./routes/ManageUserRoutes');
const cartRoutes = require('./routes/CartRoutes');
const checkoutRoutes = require('./routes/CheckoutRoutes');
const ManageOrderRoutes = require('./routes/ManageOrderRoutes');
const orderRoutes = require("./routes/OrderRoutes");
const reviewRoutes = require("./routes/ReviewRoutes");
const ManageReviewRoutes = require("./routes/ManageReviewRoutes");



// Use routes
app.use('/api/v1', userRoutes);
app.use('/api/v1', productRoutes); 
app.use('/api/v1', supplierRoutes); 
app.use('/api/v1', manageUserRoutes);
app.use('/api/v1', cartRoutes);
app.use('/api/v1', checkoutRoutes);
app.use('/api/v1', ManageOrderRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", reviewRoutes);
app.use("/api/v1", ManageReviewRoutes);

// ========== HEALTH CHECK ENDPOINT ==========
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Backend server is running!',
        timestamp: new Date().toISOString()
    });
});



module.exports = app;