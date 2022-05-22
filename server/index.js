const express = require('express');
const app = express();
const port = 5000;

const config = require('./config/key');

const bodyparser = require('body-parser');
const cookieparser = require('cookie-parser');

const { User } = require('./models/User');
const { auth } = require('./middleware/auth');

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cookieparser());

const mongoose = require('mongoose');
const { reset } = require('nodemon');
mongoose
  .connect(config.mongoURI, {
    // useNewUrlparser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
  })
  .then(() => console.log('MongoDB Connected....'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!@@@');
});

app.get('/api/hello', (req, res) => {
  res.send('안녕하세요~~');
});

app.post('/api/users/register', (req, res) => {
  // 회원 가입 정보 Client -> DB Insert
  const user = new User(req.body);

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.post('/api/users/login', (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: '제공된 이메일에 해당하는 유저가 없습니다.',
      });
    }

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res.json({
          loginSuccess: false,
          message: '비밀번호가 틀렸습니다.',
        });
      } else {
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);

          res
            .cookie('x_auth', user.token)
            .status(200)
            .json({ loginSuccess: true, userId: user._id });
        });
      }
    });
  });
});

app.get('/api/users/auth', auth, (req, res) => {
  // 여기까지 미들웨어를 통과해 온 건 Auth가 True
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      token: '',
    },
    (err, user) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true,
      });
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
