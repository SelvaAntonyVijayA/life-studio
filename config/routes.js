var express = require('express');
var router = express.Router();

module.exports = function (app) {
  router.get('/', $user.getLogin);
  router.post('/user/login/', $user.login);
  router.get('/user/get/:userId*?', $user.get);
  router.get('/user/session', $user.getsession);
  router.all('/user/update/:userId*?', $user.update);
  router.post('/domain/get/', $domains.get);
  router.post('/tile/save', $tile.save);
  router.all('/tile/list/:organizationId*?', $tile.list);
  router.post('/tile/tilebyids/', $tile.tileByIds);
  router.all('/tile/update/:tileId', $tile.update);
  router.get('/tile/remove/:tileId', $tile.remove);
  router.get('/tile/blockbytype/:organizationId/:type/:all*?', $tile.blockByQuery);

  router.post('/tileblock/save', $tileblock.save);
  router.all('/tileblock/tile/:tileId*?', $tileblock.getBlocks);
  router.get('/tileblock/getprofile/:orgId/:language*?', $tileblock.getProfile);
  router.get('/tileblock/category/list/:orgId', $tileblock.widgetCategoryList);
  router.post('/tileblock/category/save', $tileblock.widgetCategorySave);
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
  router.all('/image/upload', $image.upload);
  router.post('/image/remove', $image.remove);
  router.get('/image/list/:orgId/:folder*?', $image.list);
  router.all('/image/crop', $image.crop);
  router.get('/image/folder/list/:orgId', $image.folder);
  router.post('/image/folder/save', $image.saveFolder);
  router.all('/image/bgpatternupload/', $image.backgroundPatternUpload);
  router.all('/image/backgroundpatternremove/', $image.backgroundPatternRemove);
  router.all('/image/listbackground/', $image.backgroundPatternList);
  router.all('/image/bggroupupload/', $image.uploadBackgroundGroup);
  router.all('/image/bggroupremove/', $image.bgGroupRemove);
  router.get('/image/listbggroup/', $image.bgGroupList);
  router.all('/image/emoticonsupload/', $image.emoticonsUpload);
  router.get('/image/emoticonslist/:orgId', $image.emoticonsList);
  router.all('/image/emoticons/delete/:orgId*?', $image.emoticonsDelete);
  router.all('/image/profileupload', $image.profiePictureUpload);
  router.all('/image/profileEncodeupload', $image.profieEncodeUpload);
  router.all('/image/streamupload', $image.streamUpload);
  router.all('/image/streamcrownupload', $image.streamCrownUpload);
  router.all('/image/streamcrownimageremove', $image.streamCrownImageRemove);
  router.all('/image/streamslist/:orgId', $image.streamList);
  router.all('/image/formphotoupload/', $image.formPhotoUpload);
  router.all('/exclusive/file/upload', $image.exclusiveFileUpload);
  router.get('/img/orgs/:orgId/:folder*?/:name*?', $image.resize);
  router.get('/img/apps/:appId/:pageId*?/:name*?', $image.resize);
  router.get('/img/emoticons/:orgId/:name*?', $image.resize);
  router.get('/img/groups/:type/:id*?/:name*?', $image.resize);
  router.get('/img/streams/:streamId/:name*?', $image.resize);
  router.get('/img/profile/:memberId/:name*?', $image.resize);
  router.all('/access/save', $access.save);
  router.get('/access/list/:type*?', $access.list);
  router.get('/access/remove:id', $access.remove);
  router.all('/access/update/:id', $access.update);
  router.all('/access/userAccesses', $access.userAccesses);
  router.get('/organization/getorgpackage/:orgId', $organization.getOrgPackage);
  router.post('/organization/save/:name*?', $organization.save);
  router.all('/organization/list', $organization.list);
  router.all('/organization/remove/:id*?', $organization.remove);
  router.all('/organization/update/:id', $organization.update);
  router.all('/organization/packageupdate/:id', $organization.packageUpdate);
  router.post('/organizationtype/save', $organizationtype.save);
  router.all('/organizationtype/list', $organizationtype.list);
  router.get('/organizationtype/remove/:id', $organizationtype.remove);

  router.all("/cms/apps/save/:name*?", $apps.save);
  router.all("/cms/apps/update/:id*?", $apps.appUpdate);
  router.all("/cms/apps/remove/:id*?", $apps.remove);
  router.all("/cms/apps/list/:orgId/:isAdmin*?", $apps.list);
  router.all("/app/id/:pin*?", $apps.getAppByPin);
  router.all("/app/auth/:appid*?", $apps.auth);
  router.all("/app/profiledata/:appId", $apps.appProfileData)

  router.all('/location/list/:appId*?', $location.list);
  router.all("/location/save/:name*?", $location.save);
  router.all("/location/update/:id*?", $location.update);
  router.all("/location/remove/:id*?", $location.remove);
  router.all('/cms/loc/list/:orgid*?/:appid*?', $location.list);

  router.all('/page/save', $page.save);
  router.all('/page/update/:menuId*?', $page.update);
  router.all('/page/pagestreamupdate/', $page.pageStreamUpdate);
  router.all('/page/remove/:menuId', $page.remove);
  router.all('/pages/list/:orgId/:appId/:locationId*?/:language*?', $page.list);
  router.all('/pages/getpagetiles/', $page.getPageTiles);
  router.all('/pages/theme/save/', $page.pageThemeSave);
  router.all('/pages/theme/update/:themeId', $page.pageThemeUpdate);
  router.all('/pages/theme/list/:appId/:locationId*?', $page.pageThemeList);
  router.all('/pages/squares/:orgId/:appId/:locationId*?', $page.squares);
  router.all('/pages/tile/:orgId/:appId/:locationId*?', $page.tile);
  router.all('/pages/questionnaires/:orgId/:appId/:locationId*?', $page.questionnaires);

  router.all('/livestream/save?', $livestream.save);
  router.all('/livestream/list/:orgId*?/:appId*?/:locationId*?', $livestream.list);
  router.all('/livestream/update/:livestreamId/:appId*?', $livestream.update);
  router.all('/livestream/groupupdate/:id*?', $livestream.groupUpdate);
  router.all('/livestream/like/:id*?', $livestream.like);
  router.all('/livestream/dislike/:id*?', $livestream.unlike);
  router.all('/livestream/remove/:id*?', $livestream.remove);
  router.all('/livestream/get/:id*?', $livestream.byId);

  router.all('/files/delete/:orgId*', $image.fileDelete);
  router.get('/files/url/:orgId', $image.urlList);

  router.post('/package/save', $package.save);
  router.all('/package/list', $package.list);
  router.get('/package/remove:id*?', $package.remove);
  router.all('/package/update/:id*?', $package.update);
  router.all('/tcc/save', $package.tccsave);
  router.all('/tcc/list', $package.tcclist);

  router.post('/integration/save', $integration.save);
  router.all('/integration/list/:appid*?', $integration.list);
  router.get('/integration/remove/:id', $integration.remove);
  router.all('/integration/update/:id', $integration.update);
  router.all('/integration/getintegrations/:appid*?', $integration.getIntegrationsByApp);
  router.all('/integration/getccb/', $integration.getCCBData);
  router.all('/integration/individualsave/', $integration.individualSave);
  router.all('/integration/updateccb/', $integration.updateCCBIndividual);

  router.all('/integrationtype/save', $integrationtype.save);
  router.all('/integrationtype/list/:id*?', $integrationtype.list);
  router.all('/integrationtype/remove/:id*?', $integrationtype.remove);

  router.all('/integrationwidgets/save', $integrationwidgets.save);
  router.all('/integrationwidgets/list/:id*?', $integrationwidgets.list);
  router.all('/integrationwidgets/remove/:id*?', $integrationwidgets.remove);

  router.all('/language/save', $languages.save);
  router.all('/language/update/:id*?', $languages.update);
  router.all('/language/remove/:id*?', $languages.remove);
  router.get('/language/list', $languages.list);

  router.get('/pagesettings/list/:orgId/:appId/:locationId*?', $pagesettings.list);
  router.post('/pagesettings/save', $pagesettings.save);
  router.all('/pagesettings/remove/:id', $pagesettings.remove);

  router.get('/migration/apps/data/:id*?', $datamigration.appMigration);
  router.post('/migration/members/data/:id*?', $datamigration.memberMigration);
  router.all('/migration/data', $datamigration.migration);

  router.get('/app/member/plget/:appid*/:memberid*?', $member.getpreferredlocation);
  router.all('/app/member/plsave:id*?', $member.savepreferredlocation);
  router.all('/app/square/assign', $member.squareAssign);
  router.all('/app/member/preferredlocation/assigned/:locationid*?', $member.getAssignedPl);

  router.get('/engine/list/', $engines.list);
  router.all('/engine/save?', $engines.save);

  router.all('/smartengine/save', $smartengine.save)
  router.all('/smartengine/list/:orgId/:appId', $smartengine.list);
  router.all('/smartengine/remove', $smartengine.remove);

  router.all('/hsrengine/list/:orgId/:ruleId*?', $healthstatusrules.list);
  router.all('/hsrengine/getall/:orgId', $healthstatusrules.getall);
  router.all('/hsrengine/save', $healthstatusrules.save);
  router.all('/hsrengine/remove/:ruleId', $healthstatusrules.remove);

  router.all('/qaweights/getapptilessquares/:orgId', $qaweights.getAppTilesSquares);
  router.all('/qaweights/saveweight/', $qaweights.saveWeight);
  router.all('/qaweights/getweight/:orgId/:weightId*?', $qaweights.getWeight);
  router.all('/qaweights/removeweight/:weightId*?', $qaweights.removeWeight);

  router.all('/reportrule/getallsquares/:orgId', $reportrule.getall);
  router.all('/reportrule/list/:orgId/:ruleId*?', $reportrule.list);

  router.get('/media/list/:appId/:tileId/:type', $media.list);

  app.use('/', router);
};