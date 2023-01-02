const router = require('express').Router();
const axios = require('axios');
const fileMiddleware = require('../middlewares/file.js');

const categoryRouter = require('./categoryRouter.js');
const historyRouter = require('./historyRouter.js');
const productRouter = require('./productRouter.js');
const newsRouter = require('./newsRouter.js');
const searchRouter = require('./searchRouter.js');
const authorizationRouter = require('./authorizationRouter.js');
const usersRouter = require('./usersRouter.js');
const imageUploadController = require('../controllers/imageUploadController.js');
const oferController = require('../controllers/oferController.js');

router.use('/auth', authorizationRouter);
router.use('/category', categoryRouter);
router.use('/product', productRouter);
router.use('/news', newsRouter);
router.use('/history', historyRouter);
router.use('/search', searchRouter);
router.use('/users', usersRouter);

router.use('/ofer', oferController.createOfer);

router.use(
  '/upload/:type/:id',
  fileMiddleware.single('avatar'),
  imageUploadController.uploadCategoryImage
);

router.use('/currency', (req, res) => {
  try {
    axios
      .get('https://api.privatbank.ua/p24api/pubinfo?exchange&coursid=11')
      .then((response_currency) => {
        const url =
          'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=rub&json';
        axios
          .get(url, {
            headers: {
              Accept: 'application/json',
              'Accept-Encoding': 'identity',
            },
            params: { trophies: true },
          })
          .then((response_ruble) => {
            ruble_currency = response_ruble.data[0];
            res.status(200).json([
              ...response_currency.data,
              {
                ccy: 'UAH',
                base_ccy: 'UAH',
                buy: '1',
                sale: '1',
              },
              {
                ccy: 'RUB',
                base_ccy: 'UAH',
                sale: ruble_currency.rate,
                buy: ruble_currency.rate,
              },
            ]);
          });
      });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
