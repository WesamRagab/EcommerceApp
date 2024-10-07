const fa = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');
const { Product, validateCreateProduct, validateUpdateProduct } = require('../models/Product');
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require('../utils/cloudinary');

// Create Product
// module.exports.createProductCtrl = asyncHandler(async (req, res) => {
//    //1 validation for img
//    if(!req.file){
//     return res.status(404).json({message: "No Image Provided"}); 
// }
// //2 validation for data
// const {error} = validateCreateProduct(req.body);
// if(error){
//     return res.status(400).json({message: error.details[0].message});
// }
// //3 upload \photo
//  const imagePath = path.join( __dirname, `../images/${req.file.filename}`);
//  const result = await cloudinaryUploadImage(imagePath);

//  const product = await Product.create({
//     title: req.body.title,
//     description: req.body.description,
//     user: req.user.id, 
//     price: req.body.price,
//     discount: req.body.discount,
//     discountedPrice: req.body.discountedPrice,
//     category: req.body.category,
//     image: {
//         url: result.secure_url,
//         publicId: result.public_id
//     },
//     stock: req.body.stock
// });
//     res.status(201).json(product);

//     //6 delete the uploaded image
//     fa.unlinkSync(imagePath); 
// });

module.exports.createProductCtrl = asyncHandler(async (req, res) => {
   // 1. Validate if at least one image is provided
   if (!req.files || req.files.length === 0) {
      return res.status(404).json({ message: "No Images Provided" });
   }

   // 2. Validate the product data
   const { error } = validateCreateProduct(req.body);
   if (error) {
      return res.status(400).json({ message: error.details[0].message });
   }

   // 3. Upload images
   const images = [];
   for (const file of req.files) {
      const imagePath = path.join(__dirname, `../images/${file.filename}`);
      const result = await cloudinaryUploadImage(imagePath);
      images.push({ url: result.secure_url, publicId: result.public_id });

      // 4. Delete the local file after uploading to cloudinary
      fa.unlinkSync(imagePath);
   }

   // 5. Create the product with multiple images
   const product = await Product.create({
      title: req.body.title,
      description: req.body.description,
      user: req.user.id,
      price: req.body.price,
      discount: req.body.discount,
      discountedPrice: req.body.discountedPrice,
      category: req.body.category,
      images: images,  // Storing the uploaded images array
      stock: req.body.stock
   });

   // 6. Send the response
   res.status(201).json(product);
});

module.exports.getAllProductsCtrl = asyncHandler(async (req, res) => {
    const { category, sortBySold, hasDiscount } = req.query;

    // Build the filter object
    let filter = {};
    if (category) {
        filter.category = category; // Filter by category
    }
    if (hasDiscount) {
        filter.discount = { $gt: 0 }; // Filter products that have a discount
    }

    // Build the sort object
    let sortOption = {};
    if (sortBySold) {
        sortOption.soldCount = -1; // Sort by sold count (best sellers)
    }
    //  Exclude sold-out products
    // if (req.query.excludeSoldOut) {
    //     filter.stock = { $gt: 0 };
    // }

    // Fetch the products based on the filter and sort options
    const products = await Product.find(filter)
        .populate('category', 'name') // Populate category details if needed
        .sort(sortOption);

    res.status(200).json(products);
});



// Get Single Product
module.exports.getSingleProductCtrl = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate("user", ["-password"]);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
});


module.exports.getBestSellersCtrl = asyncHandler(async (req, res) => {
    const bestSellers = await Product.find({})
        .sort({ soldCount: -1 }) // Sort by soldCount in descending order
        .limit(10); // Get top 10 best sellers

    res.status(200).json(bestSellers);
});

// Update Product
module.exports.updateProductCtrl = asyncHandler(async (req, res) => {
    const { error } = validateUpdateProduct(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    if (req.user.id !== product.user.toString()) {
        return res.status(403).json({ message: "Access denied" });
    }

    // Update product details
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            discount: req.body.discount,
            category: req.body.category,
            
        }
    }, { new: true }).populate("user", ["-password"]);
    res.status(200).json(updatedProduct);
});

module.exports.updateProductPhotosCtrl = asyncHandler(async (req, res) => {
    const productId = req.params.id;

    // 1. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    // 2. Validate if new images are provided
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No new images provided" });
    }

    // 3. Remove old images from Cloudinary
    for (const image of product.images) {
        if (image.publicId) {
            await cloudinaryRemoveImage(image.publicId);
        }
    }

    // 4. Upload new images to Cloudinary
    const newImages = [];
    for (const file of req.files) {
        const imagePath = path.join(__dirname, `../images/${file.filename}`);
        const result = await cloudinaryUploadImage(imagePath);
        newImages.push({ url: result.secure_url, publicId: result.public_id });

        // Delete local image after upload
        fa.unlinkSync(imagePath);
    }

    // 5. Update product with new images
    product.images = newImages;
    await product.save();

    // 6. Send response
    res.status(200).json({ message: "Product images updated successfully", product });
});

// Delete Product
module.exports.deleteProductCtrl = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    if (req.user.isAdmin || req.user.id === product.user.toString()) {
        // Remove images from Cloudinary
        await Product.findByIdAndDelete(req.params.id);
            await cloudinaryRemoveImage(product.image.publicId);
        res.status(200).json({ message: "Product deleted successfully", productId: product._id });
    } else {
        return res.status(403).json({ message: "Not allowed to delete this product" });
    }
});
