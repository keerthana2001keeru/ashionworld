const checkAuth = (req, res, next) => {
  if (req.session.user) {
    
    next();
  } else {
    res.redirect("/login");
  }
};
const checkAdmin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/adminLogin");
  }
};

module.exports = {
  checkAuth,
  checkAdmin,
};
