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
  return await Product.findByIdAndUpdate(productId, reqData)

}

async function findProductById(productId){
  const product = await Product.findById(productId).populate('category').exec();

  if(!product){
    throw new Error(`Product not found with id: ${productId}`);
  }

  return product;
}

async function getAllProducts(reqQuery){
  let { levelThree, levelOne, levelTwo, color, sizes, minPrice, maxPrice, minDiscount, sort, stock, pageNumber, pageSize } = reqQuery;

  pageSize = pageSize || 10;

  let query = Product.find().populate('category')

  if (levelThree){
    // Znajdź kategorię poziomu 1
    const existCategory1 = await Category.findOne({ name: levelOne, level: 1 });
    console.log(existCategory1)
    if (!existCategory1) {
      console.log(1)
      return { content: [], currentPage: 1, totalPage: 0 };
    }

    // Znajdź kategorię poziomu 2, której parent to levelOne
    const existCategory2 = await Category.findOne({
      name: levelTwo,
      level: 2,
      parentCategory: existCategory1._id,
    });
    console.log(existCategory2)
    if (!existCategory2) {
      console.log(2)
      return { content: [], currentPage: 1, totalPage: 0 };
    }

    // Znajdź kategorię poziomu 3, której parent to levelTwo
    const existCategory3 = await Category.findOne({
      name: levelThree,
      level: 3,
      parentCategory: existCategory2._id

    });
    console.log(existCategory3)
      console.log(3)
    if (!existCategory3) {
      return { content: [], currentPage: 1, totalPage: 0 };
    }

    query = query.where('category').equals(existCategory3._id);
  }

  if(color) {
    const colorSet = new Set(color.split(",").map(color => color.trim().toLowerCase()));
    const colorRegex = colorSet.size > 0 ? new RegExp([...colorSet].join("|"), "i") : null;
    query = query.where("color").regex(colorRegex);
  }

  if(sizes) {
    const sizesSet = new Set(sizes);
    query.query.where("sizes.name").in([...sizesSet]);
  }

  if(minPrice && maxPrice) {
    query = await query.where('discountedPrice').gte(minPrice).lte(maxPrice);
  }

  if (minDiscount) {
    query = query.where("discount").gt(minDiscount)
  }


  if(stock) {
    if(stock === "in_stock") {
      query = query.where("quantity").gt(0);
    } else if(stock === "out_of_stock") {
      query = query.where("quantity").gt(1);
    }
  }

  if(sort) {
    const sortDirection = sort === "price_hight" ? -1 : 1;
    query = query.sort({discountedPrice: sortDirection});
  }

  const totalProducts = await Product.countDocuments(query);

  const skip = (pageNumber-1) * pageSize;

  query = query.skip(skip).limit(pageSize);

  const products = await query.exec();

  const totalPages = Math.ceil(totalProducts/pageSize);

  return {
    content: products,
    currentPage: pageNumber,
    totalPages,
  }

}


async function createMultipleProduct(products) {
  for(let product of products) {
    await createProduct(product);
  }
}

module.exports = {
  createProduct,
  deleteProduct,
  updateProduct,
  getAllProducts,
  findProductById,
  createMultipleProduct
}