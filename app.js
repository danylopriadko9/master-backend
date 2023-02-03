const express = require('express');
const cors = require('cors');
const router = require('./routes');
const path = require('path');
const cookieParser = require('cookie-parser');
const { languageMiddleware } = require('./middlewares/language');
require('dotenv').config();

const router2 = require('./router2');

const port = process.env.PORT || 8000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(languageMiddleware);
app.use(express.static(__dirname + '/build'));

app.use('/api', router2);

app.use('/', router);
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

app.use('/static', express.static(path.join(path.resolve() + '/static')));

app.listen(port, () => {
  console.log('Server is running on' + port);
});
