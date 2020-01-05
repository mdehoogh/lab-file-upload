const express = require('express');
const router  = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  // MDH@05JAN20120: user is supposed to end up in req.user (because of what passport does?????)
  res.render('index', { title: 'Express - Generated with IronGenerator',user:req.user });
});

module.exports = router;
