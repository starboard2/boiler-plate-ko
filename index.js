const express = require('express');
const app = express();
const port = 5000;

const config = require('./config/key');

const bodyparser = require('body-parser');
const { User } = require('./models/User');

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

const mongoose = require('mongoose');
mongoose
  .connect(config.mongoURI, {
    // useNewUrlparser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
  })
  .then(() => console.log('MongoDB Connected....'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!@@@');
});

app.post('/register', (req, res) => {
  // 회원 가입 정보 Client -> DB Insert
  const user = new User(req.body);

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
