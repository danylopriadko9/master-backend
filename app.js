const express = require('express');
const cors = require('cors');
const router = require('./routes');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const port = process.env.PORT || 8000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/', router);

app.use('/static', express.static(path.join(path.resolve() + '/static')));

app.listen(port, () => {
  console.log('Server is running on' + port);
});
