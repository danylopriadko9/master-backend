function languageMiddleware(req, res, next) {
  // Получаем значение параметра language из URL-запроса
  const { lan } = req.query;

  // Если language присутствует, то записываем его в res.locales.language
  if (lan) res.locals.language_id = lan === 'ru' ? 1 : 2;

  // Переходим к следующему middleware
  next();
}

module.exports = { languageMiddleware };
