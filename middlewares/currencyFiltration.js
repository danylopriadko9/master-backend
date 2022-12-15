const { default: axios } = require('axios');
const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');

const currencyFiltration = async (req, res, next) => {
  try {
    const { url } = req.params;
    const { brands } = req.body;

    let q = Queries.getManufacturersAndPriceByCategory;

    if (brands.length) {
      q += ` AND p.manufacturer_id IN(?)`;
    }

    let [rows, filds] = await pool.query(q, [url, brands]);

    if (!req.body.max && !req.body.min) {
      res.locals.filtred_ids = rows.map((el) => el.id);
      next();
      return;
    }

    const { data } = await axios.get(
      'https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11'
    );

    const rub = await axios.get(
      'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=rub&json',
      {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'identity',
        },
        params: { trophies: true },
      }
    );

    const currency = [
      ...data,
      {
        ccy: 'RUB',
        base_ccy: 'UAH',
        buy: rub.data[0].rate,
        sale: rub.data[0].rate,
      },
    ];

    const calcPriceForOneProducts = (item) => {
      if (item.iso === 'UAH') {
        return item.discount_price ? item.discount_price : item.base_price;
      }

      const actualProductCurrency = currency.find((el) => el.ccy === item.iso);
      return item.discount_price
        ? Number(item.discount_price) * Number(actualProductCurrency.sale)
        : Number(item.base_price) * Number(actualProductCurrency.sale);
    };

    const result = rows.map((el) => {
      const price = calcPriceForOneProducts(el);

      if (req.body.min && !req.body.max && price >= req.body.min) return el.id;
      else if (req.body.max && !req.body.min && price <= req.body.max)
        return el.id;
      else if (
        req.body.max &&
        req.body.min &&
        price <= req.body.max &&
        price >= req.body.min
      )
        return el.id;
      else return false;
    });

    res.locals.filtred_ids = result.filter((el) => el !== false);
    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = currencyFiltration;
