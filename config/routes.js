var express = require('express');
var router = express.Router();

module.exports = function (app) {
  router.get('/', $user.getLogin);
  router.post('/user/login/', $user.login);
  router.get('/user/get/:userId*?', $user.get);
  router.get('/user/session', $user.getsession);
  router.all('/user/update/:userId*?', $user.update);
  router.post('/domain/get/', $domains.get);
  router.all('/tile/list/:organizationId*?', $tile.list);
  router.post('/tile/tilebyids/', $tile.tileByIds);
  router.all('/tile/update/:tileId', $tile.update);
  router.post('/tileblock/save', $tileblock.save);
  router.all('/tileblock/tile/:tileId*?', $tileblock.getBlocks);
  router.get('/tileblock/getprofile/:orgId/:language*?', $tileblock.getProfile);
  router.get('/tileblock/category/list/:orgId',  $tileblock.widgetCategoryList);
  router.get('/tilecategory/list/:orgId', $tilecategory.get);
  router.post('/tilecategory/save', $tilecategory.save);
  router.post('/event/save', $event.save);
  router.get('/event/list/:orgId/:eventId*?', $event.list);
  router.get('/event/get/:eventId', $event.get);
  router.get('/event/remove/:eventId', $event.remove);
  router.post('/event/eventbytiles/', $event.eventByTiles);
  router.get('/event/tile/deactivate/:eventId/:tileId/:position', $event.deActivate);
  router.get('/event/tile/activate/:eventId/:tileId/:position', $event.activate);
  router.post('/eventcategory/save', $eventcategory.save);
  router.get('/eventcategory/list/:orgId', $eventcategory.list);
  router.get('/language/list', $languages.list);
  router.post('/tilist/save', $tilist.save);
  router.get('/tilist/remove/:tilistId', $tilist.remove);
  router.get('/tilist/list/:orgId/:tilistId*?', $tilist.list);
  router.get('/tilist/folderbytiles/:tilistId', $tilist.folderByTiles);
  router.post('/catilist/save', $catilist.save);
  router.get('/catilist/list/:orgId/:categoryId*?', $catilist.list);
  router.get('/catilist/delete/:categoryId', $catilist.deleteCatilist);
  router.post('/tiletheme/save/', $theme.save);
  router.all('/tiletheme/list/:id*?', $theme.list);
  router.all('/app/tiletheme/:id', $theme.get);
  router.all('/tiletheme/remove/:id*?', $theme.remove);
  router.post('/tiletheme/tilePreviewUpdate', $theme.tilePreviewUpdate);
  router.post('/procedurecategory/save', $eventcategory.saveProcedureCategory);
  router.get('/procedurecategory/list/:orgId', $eventcategory.listProcedureCategory);
  router.get('/procedure/list/:orgId/:procedureId*?', $procedure.list);
  router.get('/procedure/getbytiles/:procedureId', $procedure.getByTiles);
  router.post('/procedure/save', $procedure.save);
  router.get("/procedure/remove/:procedureId", $procedure.remove);
  app.use('/', router);
};
