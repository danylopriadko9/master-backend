const Queries = {
  getAllCategories: `
        SELECT 
        category.id, 
        category_lang.name, 
        category_lang.url, 
        category_lang.description, 
        category_lang.meta_title, 
        category_lang.meta_keywords, 
        category_lang.meta_description,
        category.parent_id
        FROM category, category_lang
        WHERE category.id = category_lang.category_id
        AND url IS NOT NULL
        AND status = 1 
        AND category_lang.language_id = 1
  `,

  getOneProductByUrl: `
        SELECT distinct
        pl.name as product_name, 
        cl.name as category_name, 
        pl.url, 
        pp.base_price, 
        pp.discount_percent, 
        pc.product_id,
        pl.description,
        pl.meta_description,
        pl.meta_title,
        pl.meta_keywords,
        pc.category_id,
        c.id,
        c.iso,
        cl.url as category_url
        FROM product_category pc
        JOIN product_lang pl 
        ON pc.product_id = pl.product_id
        JOIN category_lang cl 
        ON pc.category_id = cl.category_id
        JOIN product_price pp 
        ON pc.product_id = pp.product_id
        JOIN product p 
        ON pc.product_id = p.id
        JOIN currency c
        ON c.id = pp.currency_id
        WHERE pl.url = ?
        AND cl.language_id = 1
    `,

  checkTypeOfGroup: `
    SELECT DISTINCT
    c.id
    FROM category c
    JOIN category_lang cl
    ON cl.category_id = c.id
    AND cl.url = ?
    AND c.parent_id = 0
  `,

  getSearchProductsInSubcategory: `
      SELECT DISTINCT
      pl.name as product_name, 
      cl.name as category_name, 
      pl.url, 
      pp.base_price, 
      pp.discount_percent, 
      pc.product_id,
      pc.category_id,
      c.id,
      c.iso,
      pl.product_id,
      cl.url as category_url
    FROM product_category pc
    JOIN product_lang pl 
      ON pc.product_id = pl.product_id
    JOIN category_lang cl 
      ON pc.category_id = cl.category_id
    JOIN product_price pp 
      ON pc.product_id = pp.product_id
    JOIN product_image pi 
      ON pi.product_id = pc.product_id
    JOIN currency c
      ON c.id = pp.currency_id
    WHERE pl.language_id = 1 
    AND cl.language_id = 1
    AND cl.url LIKE ?
    AND pl.name LIKE ?
    OR pc.product_id = ?
    AND cl.url LIKE ?
    OR cl.name LIKE ?
    AND cl.url LIKE ?
  `,

  getSearchProductsInParentGroup: `
      SELECT
      c.id,
      ci.dir_path,
      ci.filename,
      cl.name,
      cl.url
    FROM category c
    JOIN category_lang cl 
    ON c.id = cl.category_id
    JOIN category_image ci
    ON ci.category_id = c.id
    WHERE cl.language_id = 1
    AND cl.name LIKE ?
    AND c.parent_id IN (
      SELECT c.id
      FROM category c
      JOIN category_lang cl
        ON cl.category_id = c.id
      WHERE cl.language_id = 1 
      AND cl.url IS NOT NULL
      AND cl.url = ?
  )
  `,

  getSearchProductsFromMainPage: `
    SELECT DISTINCT
    pl.name as product_name, 
    cl.name as category_name, 
    pl.url, 
    pp.base_price, 
    pp.discount_percent, 
    pc.product_id,
    pc.category_id,
    c.id,
    c.iso,
    pl.product_id,
    cl.url as category_url
  FROM product_category pc
  JOIN product_lang pl 
  ON pc.product_id = pl.product_id
  JOIN category_lang cl 
  ON pc.category_id = cl.category_id
  JOIN product_price pp 
  ON pc.product_id = pp.product_id
  JOIN product_image pi 
  ON pi.product_id = pc.product_id
  JOIN currency c
  ON c.id = pp.currency_id
  WHERE pl.language_id = 1 
  AND cl.language_id = 1
  AND pl.name LIKE ?
    OR cl.name LIKE ?
    OR pc.product_id = ?
  `,

  getProductsWithDiscount: `
  SELECT 
  pl.name as product_name, 
  cl.name as category_name, 
  pl.url, 
  pp.base_price, 
  pp.discount_percent, 
  pi.dir_path, 
  pi.filename, 
  pc.product_id,
  pc.category_id,
  c.id,
  c.iso,
  cl.url as category_url
FROM product_category pc
JOIN product_lang pl 
ON pc.product_id = pl.product_id
JOIN category_lang cl 
ON pc.category_id = cl.category_id
JOIN product_price pp 
ON pc.product_id = pp.product_id
JOIN product_image pi 
ON pi.product_id = pc.product_id
JOIN currency c
ON c.id = pp.currency_id
WHERE pl.language_id = 1 
AND cl.language_id = 1
AND pp.discount_percent > 25
    `,

  getNewProducts: `
    SELECT distinct
    pl.name as product_name, 
      cl.name as category_name, 
      pl.url, 
      pp.base_price, 
      pp.discount_percent, 
      pc.product_id,
      cl.category_id,
      c.id,
      c.iso,
      cl.url as category_url
  FROM product_category pc
  JOIN product_lang pl 
    ON pc.product_id = pl.product_id
  JOIN category_lang cl 
    ON pc.category_id = cl.category_id
  JOIN product_price pp 
    ON pc.product_id = pp.product_id
  JOIN product_image pi 
    ON pi.product_id = pc.product_id
  JOIN product p 
    ON pc.product_id = p.id
  JOIN currency c
    ON c.id = pp.currency_id
  WHERE pl.language_id = 1 
  AND cl.language_id = 1
  ORDER BY p.t_created DESC
  LIMIT 20
    `,

  getProductsByIds: `
SELECT distinct
pl.name as product_name,
cl.name as category_name,
pl.url,
pp.base_price,
pp.discount_percent,
pc.product_id,
pl.description,
pl.meta_description,
pl.meta_title,
pc.category_id,
c.id,
c.iso,
cl.url as category_url
FROM product_category pc
JOIN product_lang pl
ON pc.product_id = pl.product_id
JOIN category_lang cl
ON pc.category_id = cl.category_id
JOIN product_price pp
ON pc.product_id = pp.product_id
JOIN product p
ON pc.product_id = p.id
JOIN currency c
ON c.id = pp.currency_id
WHERE cl.language_id = 1
    `,

  getProductsByCaregory: `
    SELECT DISTINCT
    pc.product_id, 
        pc.category_id, 
        pl.name AS product_name, 
        pl.url, 
        pl.meta_keywords,
        cl.name AS category_name,
        cl.url AS category_url,
        pp.base_price,
        pp.discount_percent,
        c.iso,
        ml.name,
        ml.manufacturer_id
      FROM product_category pc
      JOIN category_lang cl 
        ON cl.category_id = pc.category_id
      JOIN product_lang pl 
        ON pl.product_id = pc.product_id
      JOIN product_price pp 
        ON pp.product_id = pc.product_id
      JOIN currency c
        ON c.id = pp.currency_id
    JOIN product p 
      ON p.id = pl.product_id
    JOIN manufacturer_lang ml
      ON ml.manufacturer_id = p.manufacturer_id
      WHERE cl.language_id = pl.language_id = 1
      AND cl.url LIKE ?
    `,

  getAllNews: `
    SELECT news_id, name, short_description, description, meta_title, t_created
    FROM news, news_lang
    WHERE news.id = news_lang.id AND language_id = 1
    ORDER BY sort DESC
    `,

  getOneNewById: `
    SELECT news_id, name, short_description, description, meta_title, t_created
    FROM news, news_lang
    WHERE news.id = news_lang.id AND language_id = 1
    AND news.id = ?
    ORDER BY sort DESC
  `,

  getManufacturersAndQtyOfProducts: `
    SELECT
    ml.name,
      ml.manufacturer_id,
      COUNT(*) as qty
    FROM product_category pc
    JOIN category_lang cl 
      ON cl.category_id = pc.category_id
    JOIN product_lang pl 
      ON pl.product_id = pc.product_id
    JOIN product_price pp 
      ON pp.product_id = pc.product_id
    JOIN currency c
      ON c.id = pp.currency_id
  JOIN product p 
    ON p.id = pl.product_id
  JOIN manufacturer_lang ml
    ON ml.manufacturer_id = p.manufacturer_id
    WHERE cl.language_id = 1
    AND pl.language_id = 1
    AND ml.language_id = 1
    AND cl.url LIKE ?
  GROUP BY ml.name
    `,

  getCharacteristicsCategory: `
        SELECT DISTINCT 
        pl.name AS characteristic,
        pl.property_id
        FROM product_rel_property_value prpv
        JOIN property_value_lang pvl 
        ON pvl.property_value_id = prpv.property_value_id
        JOIN property_lang pl 
        ON pl.property_id = prpv.property_id
        JOIN product_category pc
        ON pc.product_id = prpv.product_id
        JOIN category_lang cl 
        ON cl.category_id = pc.category_id
        WHERE pl.language_id = pvl.language_id = 1
        AND prpv.status LIKE 'enabled'
        AND cl.url LIKE ?
`,

  getFiltrationParamsByCategory: `
    SELECT DISTINCT
          pl.name, 
          pvl.name,
          prpv.property_value_id,
          pc.product_id,
          prpv.property_id
        FROM master.product_rel_property_value prpv
        JOIN property_lang pl 
          ON pl.property_id = prpv.property_id
        JOIN product_category pc
          ON pc.product_id = prpv.product_id
        JOIN category_lang cl
          ON cl.category_id = pc.category_id
        JOIN property_value_lang pvl
          ON pvl.property_value_id = prpv.property_value_id
        WHERE cl.url = ?
        AND pl.language_id = 1
        AND cl.language_id = 1
        AND pvl.language_id = 1
`,

  getProductCharacteristicsById: `
    SELECT DISTINCT 
    prpv.product_id, 
    pl.name AS characteristic, 
    pvl.name AS value,
    p.guarantee,
    pl.property_id
    FROM product_rel_property_value prpv
    JOIN property_value_lang pvl ON pvl.property_value_id = prpv.property_value_id
    JOIN property_lang pl ON pl.property_id = prpv.property_id
    JOIN product p ON p.id = prpv.product_id
    WHERE pl.language_id = pvl.language_id = 1
    AND prpv.status LIKE 'enabled'
    AND prpv.product_id = ?
`,

  getProductsPropertiesProducts: `
    SELECT DISTINCT 
    relation_product_id AS product_id, 
    pl.name AS product_name, 
    pl.description, 
    pl.url, 
    cl.name AS category_name,
    pp.base_price,
    pp.discount_percent,
    c.iso,
    cl.url as category_url,
    cl.category_id
    FROM product_rel_product prp
    JOIN product_lang pl 
    ON pl.product_id = prp.relation_product_id
    JOIN product_category pc 
    ON pc.product_id = prp.relation_product_id
    JOIN product_price pp 
    ON pp.product_id = prp.relation_product_id
    JOIN category_lang cl 
    ON cl.category_id = pc.category_id
    JOIN currency c
    ON c.id = pp.currency_id
    WHERE pl.language_id = 1
    AND cl.language_id = 1
`,

  getAllProductPhotosById: `
    SELECT filename
    FROM product p
    JOIN product_image pi ON p.id = pi.product_id
    WHERE p.id = ?
`,

  getSubcategoriesByCategoryUrl: `
  SELECT 
  c.id,
  ci.dir_path,
    ci.filename,
    cl.name,
    cl.url
FROM category c
JOIN category_lang cl 
  ON c.id = cl.category_id
JOIN category_image ci
  ON ci.category_id = c.id
WHERE cl.language_id = 1
AND c.parent_id IN (
  SELECT c.id
  FROM category c
  JOIN category_lang cl
    ON cl.category_id = c.id
  WHERE cl.language_id = 1 
  AND cl.url IS NOT NULL
    AND cl.url = ?
)
`,

  getProductsFromOnePageByCategory: `
SELECT DISTINCT
pc.product_id, 
    pc.category_id, 
    pl.name AS product_name, 
    pl.url, 
    pl.meta_keywords,
    cl.name AS category_name,
    cl.url AS category_url,
    pp.base_price,
    pp.discount_percent,
    c.iso,
    ml.name,
    ml.manufacturer_id
  FROM product_category pc
  JOIN category_lang cl 
    ON cl.category_id = pc.category_id
  JOIN product_lang pl 
    ON pl.product_id = pc.product_id
  JOIN product_price pp 
    ON pp.product_id = pc.product_id
  JOIN currency c
    ON c.id = pp.currency_id
JOIN product p 
  ON p.id = pl.product_id
JOIN manufacturer_lang ml
  ON ml.manufacturer_id = p.manufacturer_id
  WHERE cl.language_id = pl.language_id = 1
  AND cl.url LIKE ?
  LIMIT ?, ?
`,

  getFiltredProductsByManufacturerAndCategory: `
    SELECT DISTINCT
    p.id,
    prpv.property_id,
    pvl.property_value_id,
    pvl.name,
    p.manufacturer_id,
    pp.base_price,
    pp.discount_percent,
    c.iso
    FROM product p
    JOIN product_rel_property_value prpv
    ON prpv.product_id = p.id
    JOIN property_value_lang pvl
    ON pvl.property_value_id = prpv.property_value_id
    JOIN product_category pc
        ON p.id = pc.product_id
    JOIN product_price pp
    ON pc.product_id = pp.product_id
    JOIN currency c
    ON c.id = pp.currency_id
    WHERE p.id IN (
        SELECT distinct p.id FROM product p
        JOIN product_category pc
            ON p.id = pc.product_id
        JOIN category_lang cl
            ON cl.category_id = pc.category_id
        WHERE cl.url = ?
    AND cl.language_id = 1
)
`,

  getHistoryByProductUrl: `
    SELECT DISTINCT
    pl.name AS product_name,
    pl.url AS product_url,
    cl.name AS category_name,
    cl.url AS category_url,
    c.parent_id,
    sc.name AS parent_name,
    sc.url AS parent_url
    FROM product_category pc
    JOIN category c
    ON c.id = pc.category_id
    JOIN product_lang pl
    ON pl.product_id = pc.product_id
    JOIN category_lang cl
    ON cl.category_id = c.id
    JOIN category_lang sc
    ON c.parent_id = sc.category_id
    WHERE pl.url = ?
`,

  getHistoryProductInParentGroupByUrls: `
    SELECT 
    pl.name AS product_name,
    pl.url AS product_url,
    cl.name AS category_name,
    cl.url AS category_url
    FROM product_lang pl
    JOIN product_category pc
    ON pc.product_id = pl.product_id
    JOIN category_lang cl
    ON cl.category_id = pc.category_id
    WHERE pl.url = ?
    AND pl.language_id = 1
    AND cl.language_id = 1
`,

  getHistoryByGroupUrl: `
    SELECT DISTINCT
    cl.name AS category_name,
    cl.url AS category_url,
    c.parent_id,
    sc.name AS parent_name,
    sc.url AS parent_url
    FROM category c
    LEFT JOIN category_lang cl
    ON cl.category_id = c.id
    LEFT JOIN category_lang sc
    ON c.parent_id = sc.category_id
    WHERE cl.url = ?
`,

  getCompareProductCharacteristicsValuesById: `
    SELECT DISTINCT 
    pvl.name AS value,
    pl.property_id,
    p.guarantee
    FROM product_rel_property_value prpv
    JOIN property_value_lang pvl 
    ON pvl.property_value_id = prpv.property_value_id
    JOIN property_lang pl 
    ON pl.property_id = prpv.property_id
    JOIN product p
    ON p.id = prpv.product_id
    WHERE pl.language_id = pvl.language_id = 1
    AND prpv.status LIKE 'enabled'
    AND prpv.product_id = ?
`,
};

module.exports = { Queries };
