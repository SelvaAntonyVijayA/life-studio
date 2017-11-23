var express = require('express');
var router = express.Router();

module.exports = function (app) {
  router.get('/', $user.getLogin);
  router.post('/user/login/', $user.login);
  router.get('/user/get/:userId*?', $user.get);
  router.get('/user/session', $user.getsession);
  router.post('/domain/get/', $domains.get);
  router.all('/tile/list/:organizationId*?', $tile.list);
  router.all('/tileblock/tile/:tileId*?', $tileblock.getBlocks);
  router.get('/tileblock/getprofile/:orgId/:language*?',  $tileblock.getProfile);
  router.get('/tilecategory/list/:orgId',  $tilecategory.get);
  router.get('/event/list/:orgId/:eventId*?', $event.list);
  router.post('/eventcategory/save', $eventcategory.save);
  router.get('/eventcategory/list/:orgId', $eventcategory.list);
  app.use('/', router);
};
