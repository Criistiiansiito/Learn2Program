const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/inicio-sesion");
    }
    next();
};

module.exports = requireAuth;