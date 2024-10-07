
const express = require('express');
require('dotenv').config();
const connectToDb = require('./config/connectToDb');
connectToDb();

const app = express();
 


// const {errorHandler, notFound} = require('./middlewares/error');
// middleware
app.use(express.json());

//Routes
app.use("/api/auth", require("./routes/authRoute"));

app.use("/api/users", require("./routes/userRoutes"));

app.use("/api/categories", require("./routes/categoriesRoutes"));

app.use("/api/products", require("./routes/productRoutes"));

app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/checkout", require("./routes/checkOutRoutes"));




const PORT = process.env.PORT ;
app.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`);
});

