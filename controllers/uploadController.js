app.post('/api/upload', (req, res) => {
  multi_upload(req, res, function (err) {
    //multer error
    if (err instanceof multer.MulterError) {
      console.log(err);
      res
        .status(500)
        .send({
          error: { msg: `multer uploading error: ${err.message}` },
        })
        .end();
      return;
    } else if (err) {
      //unknown error
      if (err.name == 'ExtensionError') {
        res
          .status(413)
          .send({ error: { msg: `${err.message}` } })
          .end();
      } else {
        res
          .status(500)
          .send({ error: { msg: `unknown uploading error: ${err.message}` } })
          .end();
      }
      return;
    }
    res.status(200).send('file uploaded');
  });
});
