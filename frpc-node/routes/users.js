var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a ......');
});

router.get('/a', function(req, res, next) {
  res.render("layout",{title:"layout",content:"layout"})
});

module.exports = router;
