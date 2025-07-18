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
    pageSize
  } = reqQuery;

  pageSize = Number(pageSize) || 12;
  pageNumber = Number(pageNumber) || 1;

  // -------------------------
  // Build a MongoDB $match obj
  // -------------------------
  const match = {};

  // Category filtering
  if (levelThree && levelTwo === undefined && levelOne === undefined) {
    match.category = levelThree; // assuming passed as ObjectId string
  }

  if (levelThree && levelTwo && levelOne) {
    const existCategory1 = await Category.findOne({ name: levelOne, level: 1 });
    if (!existCategory1) {
      return { content: [], currentPage: 1, totalPages: 0, totalProducts: 0 };
    }

    const existCategory2 = await Category.findOne({
      name: levelTwo,
      level: 2,
      parentCategory: existCategory1._id,
    });
    if (!existCategory2) {
      return { content: [], currentPage: 1, totalPages: 0, totalProducts: 0 };
    }

    const existCategory3 = await Category.findOne({
      name: levelThree,
      level: 3,
      parentCategory: existCategory2._id,
    });
    if (!existCategory3) {
      return { content: [], currentPage: 1, totalPages: 0, totalProducts: 0 };
    }

    match.category = existCategory3._id;
  }

  // Color filter
  if (color) {
    const colorSet = new Set(color.split(",").map(c => c.trim()).filter(Boolean));
    if (colorSet.size > 0) {
      match.color = { $regex: [...colorSet].join("|"), $options: "i" };
    }
  }

  // Sizes filter (elemMatch with quantity > 0)
  if (sizes) {
    const sizesArray = Array.isArray(sizes)
        ? sizes
        : sizes.split(",").map(s => s.trim()).filter(Boolean);
    if (sizesArray.length > 0) {
      match.sizes = { $elemMatch: { name: { $in: sizesArray }, quantity: { $gt: 0 } } };
    }
  }

  // Discount filter
  if (minDiscount) {
    match.discount = { $gt: Number(minDiscount) };
  }

  // Stock filter
  if (stock === "in_stock") {
    match.quantity = { $gt: 0 };
  } else if (stock === "out_of_stock") {
    match.quantity = { $lte: 0 };
  }

  // -------------------------
  // Aggregation pipeline
  // -------------------------

  // Build an expression that yields the "effective" price used for both filtering & sorting.
  const effectivePriceExpr = {
    $cond: [
      { $gt: ["$discountedPrice", 0] },
      "$discountedPrice",
      "$price",
    ],
  };

  // If min/max price were specified, apply them against effective price
  const priceFilters = [];
  if (minPrice != null && minPrice !== "") {
    priceFilters.push({ $gte: [effectivePriceExpr, Number(minPrice)] });
  }
  if (maxPrice != null && maxPrice !== "") {
    priceFilters.push({ $lte: [effectivePriceExpr, Number(maxPrice)] });
  }

  // Combine $match + optional $expr price band
  const pipeline = [{ $match: match }];

  if (priceFilters.length > 0) {
    pipeline.push({
      $match: {
        $expr: { $and: priceFilters },
      },
    });
  }

  // Populate category (like .populate('category'))
  pipeline.push(
      {
        $lookup: {
          from: "categories",            // adjust if your actual collection name differs
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } }
  );

  // Add effectivePrice field
  pipeline.push({
    $addFields: {
      effectivePrice: effectivePriceExpr,
    },
  });

  // Sorting: default low-high; use sort param
  const sortOrder = sort === "price-high-low" ? -1 : 1;
  pipeline.push({
    $sort: { effectivePrice: sortOrder, _id: 1 }, // _id tiebreaker for stability
  });

  // Pagination + total count in one go
  pipeline.push({
    $facet: {
      products: [
        { $skip: (pageNumber - 1) * pageSize },
        { $limit: pageSize },
      ],
      totalCount: [
        { $count: "count" },
      ],
    },
  });

  // Run aggregation
  const aggResult = await Product.aggregate(pipeline).exec();

  const products = aggResult[0]?.products ?? [];
  const totalProducts = aggResult[0]?.totalCount?.[0]?.count ?? 0;
  const totalPages = Math.ceil(totalProducts / pageSize) || 0;

  return {
    content: products,
    currentPage: pageNumber,
    totalPages,
    totalProducts,
  };
}

async function createMultipleProduct(products) {
  for(let product of products) {
    await createProduct(product);
  }
}



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
// async function createMultipleProduct() {
//
//   const products = await Product.find({});
//   for (const product of products) {
//     product.ratings = []
//     product.reviews = []
//     await product.save();
//         }
//       }

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