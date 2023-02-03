const Queries = {
  createCategoryLang: `
  INSERT INTO category_lang (category_id, name, url, meta_title, meta_keywords, meta_description, language_id)
  VALUES (?);
  `,

  getAllProductPhotos: `
  SELECT filename FROM product_image pi
  WHERE pi.product_id in (?)
  ORDER BY type DESC
  `,

  getAllProductPhotosByUrl: `
  SELECT DISTINCT filename FROM product_image pi
  JOIN product_lang pl
    ON pl.product_id = pi.product_id
    WHERE pl.url = ?
    ORDER BY type DESC
  `,

  getProductDescription: `
  SELECT description FROM product_lang pl WHERE pl.product_id = ? AND pl.language_id = ?
  `,

  getProductDescriptionByUrl: `
  SELECT description FROM product_lang pl WHERE pl.url = ? AND pl.language_id = ?

  `,

  createCategory: `
    INSERT INTO category (parent_id, status)
    VALUES (?, ?);
  `,

  updateCategory: `
    UPDATE category_lang cl
    SET name = ?, url= ?, meta_title = ?, meta_keywords = ?, meta_description = ?
    WHERE category_id = ? AND cl.language_id = ?;
  `,

  createProduct: `
    INSERT INTO product (t_created, t_updated, manufacturer_id, guarantee)
    VALUES (?);
  `,

  updateProductLanguage: `
    UPDATE product_lang pl
      SET name = ?, description = ?, url = ?, meta_title = ?, meta_keywords = ?, meta_description = ?
      WHERE pl.product_id = ?
      AND pl.language_id = ?
  `,

  updateProductPrice: `
    UPDATE product_price pp
      SET base_price = ?, currency_id = ?, discount_percent = ?
      WHERE pp.product_id = ?;
  `,

  createProductLanguage: `
    INSERT INTO product_lang (name, description, url, meta_title, meta_keywords, meta_description, product_id, language_id)
    VALUES (?);
  `,

  createProductPrice: `
    INSERT INTO product_price (base_price, currency_id, discount_percent, product_id)
    VALUES (?);
  `,

  createProductCategory: `
    INSERT INTO product_category (product_id, category_id)
    VALUES (?, ?);
  `,

  getManufacturersAndPriceByCategory: `
  SELECT DISTINCT 
  p.id,
  manufacturer_id, 
    base_price, 
    ceiling(base_price - ((base_price * discount_percent)/100)) as discount_price, 
    iso  
FROM category_lang cl
JOIN product_category pc
  ON pc.category_id = cl.category_id
JOIN product p
  ON p.id = pc.product_id
JOIN product_price pp
  ON pp.product_id = p.id
JOIN currency_lang carl
  ON carl.currency_id = pp.currency_id
JOIN currency c 
  ON c.id = pp.currency_id
WHERE cl.url = ?
  `,

  getAllManufacturers: `
    SELECT m.id, ml.name FROM manufacturer m
    JOIN manufacturer_lang ml
      ON m.id = ml.manufacturer_id
    WHERE ml.language_id = ?
  `,

  getAllCategories: `
  SELECT 
  cl.category_id, 
  cl.name, 
  cl.url, 
  c.parent_id,
  ci.filename
FROM category c
JOIN category_lang cl
ON c.id = cl.category_id
JOIN category_image ci
	ON ci.category_id = c.id
AND url IS NOT NULL
AND cl.language_id = ?
  `,

  getSearchedProductsInCategory: `
  SELECT 
	pl.product_id,
    pl.name as product_name,
    pl.url,
    pc.category_id,
    cl.name as category_name,
    c.iso,
    pp.base_price,
    pp.discount_percent,
    pi.filename
FROM product_lang pl
JOIN product_category pc
	ON pc.product_id = pl.product_id
JOIN product_image pi
	ON pi.product_id = pl.product_id
JOIN category_lang cl
	ON cl.category_id = pc.category_id
JOIN product_price pp
	ON pp.product_id = pl.product_id
JOIN currency c
	ON c.id = pp.currency_id
WHERE cl.language_id = ?
AND pl.language_id = ?
AND pl.name LIKE (?)
AND cl.category_id = ?
  `,

  getCategoryProducts: `
  SELECT 
	  pl.product_id,
    pl.name as product_name,
    pl.url,
    pc.category_id,
    cl.name as category_name,
    c.iso,
    pp.base_price,
    pp.discount_percent,
    pi.filename
FROM product_lang pl
JOIN product_category pc
	ON pc.product_id = pl.product_id
JOIN product_image pi
	ON pi.product_id = pl.product_id
JOIN category_lang cl
	ON cl.category_id = pc.category_id
JOIN product_price pp
	ON pp.product_id = pl.product_id
JOIN currency c
	ON c.id = pp.currency_id
WHERE cl.language_id = ?
AND pl.language_id = ?
AND pi.type = 'main'
AND cl.url = ?
  `,

  getSearchedProducts: `
  SELECT 
	pl.product_id,
    pl.name as product_name,
    pl.url,
    pc.category_id,
    cl.name as category_name,
    c.iso,
    pp.base_price,
    pp.discount_percent,
    pi.filename
FROM product_lang pl
JOIN product_category pc
	ON pc.product_id = pl.product_id
JOIN product_image pi
	ON pi.product_id = pl.product_id
JOIN category_lang cl
	ON cl.category_id = pc.category_id
JOIN product_price pp
	ON pp.product_id = pl.product_id
JOIN currency c
	ON c.id = pp.currency_id
WHERE cl.language_id = ?
AND pl.language_id = ?
AND pl.name LIKE (?)
AND pi.type = 'main'
OR cl.name LIKE (?)
AND cl.language_id = ?
AND pl.language_id = ?
AND pi.type = 'main'
  `,

  getOneProduct: `
        SELECT distinct
          pl.name as product_name, 
          cl.name as category_name, 
          pl.url, 
          pp.base_price, 
          pp.discount_percent, 
          pp.currency_id,
          pc.product_id,
          pl.description,
          pl.meta_description,
          pl.meta_title,
          pl.meta_keywords,
          pc.category_id,
          c.id,
          c.iso,
          cl.url as category_url,
          p.guarantee,
          p.manufacturer_id
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
        WHERE cl.language_id = ?
        AND pl.language_id = ?

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
    WHERE pl.language_id = ?
    AND cl.language_id = ?
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
      ci.filename,
      cl.name,
      cl.url
    FROM category c
    JOIN category_lang cl 
    ON c.id = cl.category_id
    JOIN category_image ci
    ON ci.category_id = c.id
    WHERE cl.language_id = ?
    AND cl.name LIKE ?
    AND c.parent_id IN (
      SELECT c.id
      FROM category c
      JOIN category_lang cl
        ON cl.category_id = c.id
      WHERE cl.language_id = ?
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
  WHERE pl.language_id = ?
  AND cl.language_id = ?
  AND pl.name LIKE ?
    OR cl.name LIKE ?
    OR pc.product_id LIKE ?
  `,

  getProductsWithDiscount: `
  SELECT 
    pl.name as product_name, 
    cl.name as category_name, 
    pl.url, 
    pp.base_price, 
    pp.discount_percent, 
    pi.filename, 
    pc.product_id,
    pc.category_id,
    c.iso,
    cl.category_id
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
  WHERE pl.language_id = ?
  AND cl.language_id = ?
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
c.iso,
  pi.filename,
  cl.category_id
FROM product_category pc
JOIN product_lang pl 
  ON pc.product_id = pl.product_id
JOIN category_lang cl
  ON cl.category_id = pc.category_id
JOIN product_price pp 
  ON pc.product_id = pp.product_id
JOIN product_image pi 
  ON pi.product_id = pc.product_id
JOIN product p 
  ON pc.product_id = p.id
JOIN currency c
  ON c.id = pp.currency_id
WHERE pl.language_id = ?
AND cl.language_id = ?
AND pi.type = 'main'
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
  c.iso,
  pi.filename,
  cl.category_id
FROM product_category pc
JOIN product_lang pl
ON pc.product_id = pl.product_id
JOIN product_image pi 
ON pi.product_id = pc.product_id
JOIN category_lang cl
ON pc.category_id = cl.category_id
JOIN product_price pp
ON pc.product_id = pp.product_id
JOIN product p
ON pc.product_id = p.id
JOIN currency c
ON c.id = pp.currency_id
WHERE cl.language_id = ?
AND pl.language_id = ?
AND pi.type = 'main'
AND pc.product_id IN (?)
    `,

  getProductsByIdsLike: `
  SELECT distinct
  pl.name as product_name,
  cl.name as category_name,
  pl.url,
  pp.base_price,
  pp.discount_percent,
  pc.product_id,
  c.iso,
  pi.filename
FROM product_category pc
JOIN product_lang pl
ON pc.product_id = pl.product_id
JOIN product_image pi 
ON pi.product_id = pc.product_id
JOIN category_lang cl
ON pc.category_id = cl.category_id
JOIN product_price pp
ON pc.product_id = pp.product_id
JOIN product p
ON pc.product_id = p.id
JOIN currency c
ON c.id = pp.currency_id
WHERE cl.language_id = ?
AND pl.language_id = ?
AND pi.type = 'main'
AND pc.product_id LIKE (?)
  `,

  getProductsByManufacturerIdAndCategoryUrl: `
    SELECT distinct
    pl.name as product_name,
    cl.name as category_name,
    pl.url,
    pp.base_price,
    pp.discount_percent,
    pc.product_id,
    c.iso,
    pi.filename
  FROM product_category pc
  JOIN product_lang pl
  ON pc.product_id = pl.product_id
  JOIN product_image pi 
  ON pi.product_id = pc.product_id
  JOIN category_lang cl
  ON pc.category_id = cl.category_id
  JOIN product_price pp
  ON pc.product_id = pp.product_id
  JOIN product p
  ON pc.product_id = p.id
  JOIN currency c
  ON c.id = pp.currency_id
  WHERE cl.language_id = ?
  AND pl.language_id = ?
  AND pi.type = 'main'
  AND p.manufacturer_id IN (?)
  AND cl.url = ?
    `,

  getMetaCategory: `
    SELECT category_id, name, description, meta_title, meta_keywords, meta_description FROM category_lang WHERE url = ? AND language_id = ?
    `,
  getMetaProduct: `
  SELECT name, description, meta_title, meta_keywords, meta_description FROM product_lang WHERE url = ? AND language_id = ?
  `,

  getCharacteristicsByCategory: `
  SELECT prc.category_id, prc.property_id, pl.name FROM property_rel_category prc
  JOIN property_lang pl
    ON pl.property_id = prc.property_id
  WHERE prc.category_id IN (?)
  AND prc.status = 'enabled'
  AND pl.language_id = ?
  `,

  getAllProductCharacteristics: `
  SELECT prpv.product_id, prpv.property_id, pvl.name FROM product_rel_property_value prpv
JOIN property_value_lang pvl
	ON pvl.property_value_id = prpv.property_value_id
JOIN property_lang pl
	ON pl.property_id = prpv.property_id
WHERE prpv.product_id IN (?)
AND prpv.status = 'enabled'
AND pvl.language_id = ?
AND pl.language_id = ?
  `,

  getAllCharacteristicsByCategoryUrl: `
    SELECT DISTINCT prpv2.property_id, pl2.name FROM product_rel_property_value prpv2
    JOIN property_lang pl2
      ON pl2.property_id = prpv2.property_id
    JOIN property_value_lang pvl2
      ON pvl2.property_value_id = prpv2.property_value_id
    JOIN product_lang pll2
      ON pll2.product_id = prpv2.product_id
    JOIN product_category pc2
      ON pc2.product_id = pll2.product_id
    JOIN category_lang cl
      ON cl.category_id = pc2.category_id
    WHERE prpv2.status = 'enabled'
    AND cl.language_id = ?
    AND pl2.language_id = ?
    AND pll2.language_id = ?
    AND pvl2.language_id = ?
    AND cl.url = ? 
    `,

  getAllCharacteristicsValuesByCategoryUrl: `
  SELECT DISTINCT pvl3.property_value_id, pvl3.name, prpv3.property_id FROM product_rel_property_value prpv3
  JOIN property_lang pl3
    ON pl3.property_id = prpv3.property_id
  JOIN property_value_lang pvl3
    ON pvl3.property_value_id = prpv3.property_value_id
  JOIN product_lang pll3
    ON pll3.product_id = prpv3.product_id
  JOIN product_category pc
    ON pc.product_id = pll3.product_id
  JOIN category_lang cl3
    ON cl3.category_id = pc.category_id
  WHERE prpv3.status = 'enabled'
    AND cl3.language_id = ?
    AND pl3.language_id = ?
    AND pll3.language_id = ?
    AND pvl3.language_id = ?
    AND cl3.url = ? 
    `,

  getAllManufacturersByCategoryUrl: `
    SELECT DISTINCT ml.manufacturer_id, ml.name FROM manufacturer_lang ml
    JOIN product p
      ON p.manufacturer_id = ml.manufacturer_id
    JOIN product_category pc 
      ON pc.product_id = p.id
    JOIN category_lang cl 
      ON cl.category_id = pc.category_id
    WHERE cl.url=?
    `,

  getRelationProductsForAllProductsInCategory: `
    SELECT distinct
    pl.name as product_name,
    cl.name as category_name,
    pl.url,
    pp.base_price,
    pp.discount_percent,
    pc.product_id,
    c.iso,
    pi.filename
  FROM product_category pc
  JOIN product_lang pl
  ON pc.product_id = pl.product_id
  JOIN product_image pi 
  ON pi.product_id = pc.product_id
  JOIN category_lang cl
  ON pc.category_id = cl.category_id
  JOIN product_price pp
  ON pc.product_id = pp.product_id
  JOIN product p
  ON pc.product_id = p.id
  JOIN currency c
  ON c.id = pp.currency_id
  WHERE cl.language_id = ?
  AND pl.language_id = ?
  AND pi.type = 'main'
  AND pc.product_id IN (
    SELECT DISTINCT relation_product_id FROM product_lang pl
JOIN product_rel_product prp
	ON prp.product_id = pl.product_id
JOIN product_category pc
	ON pc.product_id = pl.product_id
JOIN category_lang cl
	ON cl.category_id = pc.category_id
WHERE cl.url = ?
  )
    `,

  getProductByUrl: `
    SELECT distinct
    pl.name as product_name,
    cl.name as category_name,
    pl.url,
    pp.base_price,
    pp.discount_percent,
    pc.product_id,
    c.iso,
    pi.filename,
    cl.category_id
  FROM product_category pc
  JOIN product_lang pl
  ON pc.product_id = pl.product_id
  JOIN product_image pi 
  ON pi.product_id = pc.product_id
  JOIN category_lang cl
  ON pc.category_id = cl.category_id
  JOIN product_price pp
  ON pc.product_id = pp.product_id
  JOIN product p
  ON pc.product_id = p.id
  JOIN currency c
  ON c.id = pp.currency_id
  WHERE cl.language_id = ?
  AND pl.language_id = ?
  AND pi.type = 'main'
  AND pl.url = ?
    `,

  getProductsByCategory: `
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
      WHERE cl.language_id = ?
      AND pl.language_id = ?
      AND cl.url LIKE ?
    `,

  getAllNews: `
  SELECT n.id, n.t_created, nl.url, nl.name, nl.short_description FROM news_lang nl
  JOIN news n
    ON n.id = nl.news_id
  WHERE nl.language_id = ?
  ORDER BY n.t_created DESC
    `,

  getOneNewById: `
    SELECT news_id, name, short_description, description, meta_title, t_created
    FROM news, news_lang
    WHERE news.id = news_lang.id AND language_id = ?
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
    WHERE cl.language_id = ?
    AND pl.language_id = ?
    AND ml.language_id = ?
    AND cl.url LIKE ?
  GROUP BY ml.name
    `,

  getCharacteristicsCategory: `
  SELECT 
	pl.name AS characteristic,
	pl.property_id 
FROM property_rel_category prc
JOIN property_lang pl
	ON pl.property_id = prc.property_id
WHERE prc.status = "enabled"
AND pl.language_id = ?
        
`,

  getCharacteristicsCategoryByUrl: `
SELECT 
	pl.name AS characteristic,
	pl.property_id 
FROM property_rel_category prc
JOIN property_lang pl
	ON pl.property_id = prc.property_id
JOIN category_lang cl
	ON cl.category_id = prc.category_id
WHERE status = "enabled"
AND pl.language_id = ?
AND cl.language_id = ?
AND cl.url = ?
`,

  getFiltrationParamsByCategory: `
    SELECT DISTINCT
          pvl.name,
          prpv.property_value_id,
          prpv.property_id
        FROM product_rel_property_value prpv
        JOIN property_lang pl 
          ON pl.property_id = prpv.property_id
        JOIN product_category pc
          ON pc.product_id = prpv.product_id
        JOIN category_lang cl
          ON cl.category_id = pc.category_id
        JOIN property_value_lang pvl
          ON pvl.property_value_id = prpv.property_value_id
        WHERE cl.url = ?
        AND pl.name is not null
        AND prpv.status = 'enabled'
        AND pl.language_id = ?
        AND cl.language_id = ?
        AND pvl.language_id = ?
`,

  getProductCharacteristicsById: `
    SELECT DISTINCT 
    pl.name AS characteristic, 
    pvl.name AS value,
    p.guarantee,
    pl.property_id
    FROM product_rel_property_value prpv
    JOIN property_value_lang pvl ON pvl.property_value_id = prpv.property_value_id
    JOIN property_lang pl ON pl.property_id = prpv.property_id
    JOIN product p ON p.id = prpv.product_id
    WHERE pl.language_id = ?
    AND pvl.language_id = ?
    AND prpv.status LIKE 'enabled'
    AND prpv.product_id = ?
`,

  getProductCharacteristicsByUrl: `
  SELECT DISTINCT 
  pl.name AS characteristic, 
  pvl.name AS value,
  p.guarantee,
  pl.property_id
  FROM product_rel_property_value prpv
  JOIN property_value_lang pvl ON pvl.property_value_id = prpv.property_value_id
  JOIN property_lang pl ON pl.property_id = prpv.property_id
  JOIN product p ON p.id = prpv.product_id
  JOIN product_lang pll
  ON pll.product_id = p.id
  WHERE pl.language_id = ?
  AND pvl.language_id = ?
  AND prpv.status LIKE 'enabled'
  AND pll.url = ?
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
  pi.filename
FROM product_rel_product prp
JOIN product_lang pl 
JOIN product_image pi
ON pl.product_id = pi.product_id
ON pl.product_id = prp.relation_product_id
JOIN product_category pc 
ON pc.product_id = prp.relation_product_id
JOIN product_price pp 
ON pp.product_id = prp.relation_product_id
JOIN category_lang cl 
ON cl.category_id = pc.category_id
JOIN currency c
ON c.id = pp.currency_id
WHERE pl.language_id = ?
AND cl.language_id = ?
AND pi.type = 'main'
AND prp.product_id IN(?)
`,

  getProductsPropertiesProductsByUrl: `
  SELECT DISTINCT 
  relation_product_id AS product_id, 
  pl.name AS product_name, 
  pl.description, 
  pl.url, 
  cl.name AS category_name,
  pp.base_price,
  pp.discount_percent,
  c.iso,
  pi.filename
FROM product_rel_product prp
JOIN product_lang pl 
JOIN product_image pi
ON pl.product_id = pi.product_id
ON pl.product_id = prp.relation_product_id
JOIN product_category pc 
ON pc.product_id = prp.relation_product_id
JOIN product_price pp 
ON pp.product_id = prp.relation_product_id
JOIN category_lang cl 
ON cl.category_id = pc.category_id
JOIN currency c
ON c.id = pp.currency_id
WHERE pl.language_id = ?
AND cl.language_id = ?
AND pi.type = 'main'
AND prp.product_id IN(
	SELECT product_id FROM product_lang pl WHERE pl.url = ?
)
`,

  getPropertiesProductsByIds: `
SELECT DISTINCT 
relation_product_id AS product_id, 
pl.name AS product_name, 
pl.url, 
cl.name AS category_name,
pp.base_price,
pp.discount_percent,
c.iso,
pi.filename
FROM product_rel_product prp
JOIN product_lang pl 
JOIN product_image pi
ON pl.product_id = pi.product_id
ON pl.product_id = prp.relation_product_id
JOIN product_category pc 
ON pc.product_id = prp.relation_product_id
JOIN product_price pp 
ON pp.product_id = prp.relation_product_id
JOIN category_lang cl 
ON cl.category_id = pc.category_id
JOIN currency c
ON c.id = pp.currency_id
WHERE pl.language_id = ?
AND cl.language_id = ?
AND pi.type = 'main'
AND prp.product_id IN(?)
`,

  getAllProductPhotosById: `
    SELECT id, filename, type FROM product_image pi WHERE pi.product_id = ?
`,

  getSubcategoriesByCategoryUrl: `
  SELECT 
  c.id,
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
  WHERE cl.language_id = ?
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
  WHERE cl.language_id = ?
  AND pl.language_id = ?
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
    AND cl.language_id = ?
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
    AND pl.language_id = ?
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
    AND pl.language_id = ?
    AND cl.language_id = ?
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
    AND cl.language_id = ?
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
    WHERE pl.language_id = ?
    AND pvl.language_id = ?
    AND prpv.status LIKE 'enabled'
    AND prpv.product_id = ?
`,
};

module.exports = { Queries };
