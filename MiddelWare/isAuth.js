const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.send({
      status: 400,
      message: "seccsion expired",
    });
  }
};
module.exports = isAuth;