var express = require('express');
var router = express.Router();

module.exports = function (app) {
  router.get('/', $user.getLogin);
  router.post('/user/login/', $user.login);
  router.get('/user/get', $user.get);
  router.get('/user/session', $user.getsession);
  router.post('/domain/get/', $domains.get);
  router.post('/tile/list/', $tile.list);
  router.post('/tileblock/tile/', $tileblock.get);
  router.get('/tileblock/getprofile/:orgId/:language*?',  $tileblock.getProfile);
  router.get('/tilecategory/list/:orgId',  $tilecategory.get);
  app.use('/', router);
};
