function languageMiddleware(req, res, next) {
  // Получаем значение параметра language из URL-запроса
  const language = req.params.language;

  // Если language присутствует, то записываем его в res.locales.language
  if (language) {
    res.locales.language = language;
  }

  // Переходим к следующему middleware
  next();
}

module.exports = { languageMiddleware };
