import express from 'express';
import Products from '../schemas/product.schema.js';

const router = express.Router();

/*** 상품 생성 API ***/
router.post('/products', async (req, res) => {
  const { name, description, manager, password } = req.body;

  if (!name || !description || !manager || !password) {
    return res
      .status(400)
      .json({ errorMessage: '상품 정보를 모두 입력해 주세요.' });
  }

  const sameProduct = await Products.findOne({ name }).exec();

  if (sameProduct) {
    return res.status(400).json({ errorMessage: '이미 등록 된 상품입니다.' });
  }

  const newProducts = new Products({
    name,
    description,
    manager,
    password,
    status: 'FOR_SALE',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  await newProducts.save();

  return res.status(201).json({ newProducts });
});

/*** 상품 목록 조회 API ***/
router.get('/products', async (req, res) => {
  const products = await Products.find().sort('-createdAt').exec();

  return res.status(200).json({ products });
});

/*** 상품 상세 조회 API ***/
router.get('/products/:id', async (req, res) => {
  const { id } = req.params;

  const searchProduct = await Products.findById(id).exec();
  if (!searchProduct) {
    return res.status(400).json({ errorMessage: '상품이 존재하지 않습니다.' });
  }
});

/*** 상품 수정 API ***/
router.put('/products/:id', async (req, res) => {
  const { id } = req.params;

  const { name, description, manager, status, password } = req.body;

  const currentProduct = await Products.findById(id).exec();
  if (!currentProduct) {
    return res.status(400).json({ errorMessage: '상품이 존재하지 않습니다.' });
  }

  if (currentProduct.password !== password) {
    return res
      .status(400)
      .json({ errorMessage: '비밀번호가 일치하지 않습니다.' });
  }

  if (currentProduct.name !== name) {
    const nameProduct = await Products.findOne({ name }).exec();
    if (nameProduct) {
      return res
        .status(400)
        .json({ errorMessage: '같은 이름의 상품이 존재합니다.' });
    }
  }
});

/*** 상품 삭제 API ***/
router.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const sameProduct = await Products.findById(id).exec();
  if (!sameProduct) {
    return res.status(404).json({ errorMessage: '상품이 존재하지 않습니다.' });
  }

  if (sameProduct.password === password) {
    await Products.deleteOne({ _id: id }).exec();
    return res.status(200).json();
  } else {
    return res
      .status(400)
      .json({ errorMessage: '비밀번호가 일치하지 않습니다.' });
  }
});

export default router;
