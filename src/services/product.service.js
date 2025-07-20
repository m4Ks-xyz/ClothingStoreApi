const Category = require("../models/category.model");
const Product = require("../models/product.model");


async function createProduct(reqData) {
  let topLevel = await Category.findOne({name: reqData.topLevelCategory})

  if(!topLevel){
    topLevel = new Category({
      name: reqData.topLevelCategory,
      level: 1
    })
    await topLevel.save()
  }

  let secondLevel = await Category.findOne({
    name: reqData.secondLevelCategory,
  })

  if(!secondLevel){
    secondLevel = new Category({
      name: reqData.secondLevelCategory,
      level: 2
    })
    await secondLevel.save()
  }

  let thirdLevel = await Category.findOne({
    name: reqData.thirdLevelCategory,
  })

  if(!thirdLevel){
    thirdLevel = new Category({
      name: reqData.thirdLevelCategory,
      level: 3
    })
    await thirdLevel.save()
  }

  const sizes = Array.isArray(reqData.sizes) ? reqData.sizes.map(size => ({
    name: size.name,
    quantity: size.quantity
  })) : [];

  const product = new Product({
    title: reqData.title,
    color: reqData.color,
    description: reqData.description,
    discountedPrice: reqData.price * (1 - (reqData.discount / 100)),
    discount: reqData.discount,
    imageUrl: reqData.imageUrl,
    brand: reqData.brand,
    price: reqData.price,
    sizes: sizes,
    quantity: reqData.quantity,
    category: thirdLevel._id,
    level: thirdLevel.level
  })

  return await product.save()
}
async function deleteProduct(productId){
  const product = await findProductById(productId);

  await Product.findByIdAndDelete(productId)
  return 'Product Deleted Successfully';
}

async function updateProduct(productId, reqData){
  return await Product.updateMany(productId, reqData)

}

async function findProductById(productId){
  const product = await Product.findById(productId).populate('category').exec();

  if(!product){
    throw new Error(`Product not found with id: ${productId}`);
  }

  const existCategory3 = await Category.findOne({ _id: product.category, level: 3 });
  if (!existCategory3) {
    return { content: [], currentPage: 1, totalPage: 0 };
  }

  // Znajdź kategorię poziomu 2, której parent to levelThree
  const existCategory2 = await Category.findOne({
    _id: existCategory3.parentCategory,
    level: 2,
  });

  // Znajdź kategorię poziomu 1, której parent to levelTwo
  let existCategory1 = null;
  if (existCategory2) {
    existCategory1 = await Category.findOne({
      _id: existCategory2.parentCategory,
      level: 1,
    });
  }


  return {
    details: product,
    path: {
      categoryOne: existCategory1?.name || "",
      categoryTwo: existCategory2?.name || "",
      categoryThree: existCategory3?.name || ""
    }
  };
}



async function getAllProducts(reqQuery) {
  let {
    levelThree,
    levelOne,
    levelTwo,
    color,
    sizes,
    minPrice,
    maxPrice,
    minDiscount,
    sort,
    stock,
    pageNumber,
    pageSize,
  } = reqQuery;

  pageSize = Number(pageSize) || 12;
  pageNumber = Number(pageNumber) || 1;

  // ------------------------------------------------------------- ----
  // 1. Resolve categoryId
  // ------------------------------------------------------------------
  let categoryId = null;

  // Case A: related products (only levelThree given; expected to be _id_)
  if (levelThree && !levelTwo && !levelOne) {
      // defensive: treat as name level:3
      const cat = await Category.findById(levelThree).select("_id");
      if (!cat) {
        return { content: [], currentPage: 1, totalPages: 0, totalProducts: 0 };
      }
      categoryId = cat._id;

  }

  // Case B: full browse path (names for levelOne/Two/Three)
  if (levelThree && levelTwo && levelOne) {
    const cat1 = await Category.findOne({ name: levelOne, level: 1 }).select("_id");
    if (!cat1) return { content: [], currentPage: 1, totalPages: 0, totalProducts: 0 };

    const cat2 = await Category.findOne({ name: levelTwo, level: 2, parentCategory: cat1._id }).select("_id");
    if (!cat2) return { content: [], currentPage: 1, totalPages: 0, totalProducts: 0 };

    const cat3 = await Category.findOne({ name: levelThree, level: 3, parentCategory: cat2._id }).select("_id");
    if (!cat3) return { content: [], currentPage: 1, totalPages: 0, totalProducts: 0 };

    categoryId = cat3._id

  }

  // ------------------------------------------------------------------
  // 2. Build basic $match
  // ------------------------------------------------------------------
  const match = {};
  if (categoryId) match.category = categoryId;

  // color
  if (color) {
    const colors = color.split(",").map(c => c.trim()).filter(Boolean);
    if (colors.length) {
      match.color = { $regex: colors.join("|"), $options: "i" };
    }
  }

  // sizes
  if (sizes) {
    const sizeArray = Array.isArray(sizes)
        ? sizes
        : sizes.split(",").map(s => s.trim()).filter(Boolean);
    if (sizeArray.length) {
      match.sizes = { $elemMatch: { name: { $in: sizeArray }, quantity: { $gt: 0 } } };
    }
  }

  // discount
  if (minDiscount !== undefined && minDiscount !== null && minDiscount !== "") {
    match.discount = { $gte: Number(minDiscount) };
  }

  // stock
  if (stock === "in_stock") {
    match.quantity = { $gt: 0 };
  } else if (stock === "out_of_stock") {
    match.quantity = { $lte: 0 };
  }

  // ------------------------------------------------------------------
  // 3. Effective price expression
  // ------------------------------------------------------------------
  const effectivePriceExpr = {
    $cond: [
      { $gt: ["$discountedPrice", 0] },
      "$discountedPrice",
      "$price",
    ],
  };

  // price band (applied via $expr so we filter on effective price)
  const priceConds = [];
  if (minPrice !== undefined && minPrice !== null && minPrice !== "") {
    priceConds.push({ $gte: [effectivePriceExpr, Number(minPrice)] });
  }
  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "") {
    priceConds.push({ $lte: [effectivePriceExpr, Number(maxPrice)] });
  }

  // ------------------------------------------------------------------
  // 4. Aggregation pipeline
  // ------------------------------------------------------------------
  const pipeline = [{ $match: match }];

  if (priceConds.length) {
    pipeline.push({ $match: { $expr: { $and: priceConds } } });
  }

  // compute effectivePrice (needed before sort)
  pipeline.push({
    $addFields: { effectivePrice: effectivePriceExpr },
  });

  // populate category (Product.category -> categories._id)
  pipeline.push(
      {
        $lookup: {
          from: "categories", // adjust if your actual collection name differs
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } }
  );

  // sort
  const sortOrder = reqQuery.sort === "price-high-low" ? -1 : 1;
  pipeline.push({ $sort: { effectivePrice: sortOrder, _id: 1 } });

  // paginate + total
  pipeline.push({
    $facet: {
      products: [
        { $skip: (pageNumber - 1) * pageSize },
        { $limit: pageSize },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  // ------------------------------------------------------------------
  // 5. Run + shape return
  // ------------------------------------------------------------------
  const agg = await Product.aggregate(pipeline).exec();
  const bucket = agg[0] || { products: [], totalCount: [] };

  const products = bucket.products;
  const totalProducts = bucket.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalProducts / pageSize) || 0;

  return {
    content: products,
    currentPage: pageNumber,
    totalPages,
    totalProducts,
  };
}


// async function createMultipleProduct(products) {
//   for(let product of products) {
//     await createProduct(product);
//   }
// }




// async function createMultipleProduct() {
//   const products = await Product.find();
//   for (const product of products) {
//     product.numRatings = {
//       1: 0,
//       2: 0,
//       3: 0,
//       4: 0,
//       5: 0
//     }
//     await product.save()
//   }
// }



// separetly
// async function createMultipleProduct() {
//   function getRandomQuantity() {
//     return Math.floor(Math.random() * 101);
//   }
//   const products = await Product.find({});
//   for (const product of products) {
//     product.sizes = [
//           { name: 'S', quantity: getRandomQuantity() },
//           { name: 'M', quantity: getRandomQuantity() },
//           { name: 'L', quantity: getRandomQuantity() }
//     ];
//     await product.save();
//         }
//       }


// clear products
async function createMultipleProduct() {

  const products = await Product.find({});
  for (const product of products) {
    product.ratings = []
    product.reviews = []
    await product.save();
        }
      }

      // quantity sum
// async function createMultipleProduct() {
//
//   const products = await Product.find({});
//   for (const product of products) {
//     product.quantity = product.sizes.reduce((sum, size) => sum + size.quantity, 0);
//     await product.save();
//         }
//       }


module.exports = {
  createProduct,
  deleteProduct,
  updateProduct,
  getAllProducts,
  findProductById,
  createMultipleProduct
}