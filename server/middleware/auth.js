const { User } = require('../models/User');

let auth = (req, res, next) => {
  // 클라이언트 쿠키에서 토큰을 가져온다.
  let token = req.cookies.x_auth;

  // 토큰을 복호화 한 후 유저를 찾는다.
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) {
      // 유저가 없으면 인증 No
      return res.json({
        isAuth: faslse,
        error: true,
      });
    } else {
      // 유저가 있으면 OK
      req.token = token;
      req.user = user;
      next();
    }
  });
};

module.exports = { auth };
