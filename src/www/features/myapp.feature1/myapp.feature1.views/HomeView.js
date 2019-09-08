const { VueView } = await ns('flair.ui');
const ServerDateTime = await include('myapp.feature1.services.ServerDateTime');

/**
 * @name HomeView
 * @description Default Home View
 */
Class('', VueView, function() {
    this.i18n = 'titles, strings';
    this.title = '@titles.home | Home';
    this.layout = 'myapp.shared.views.CommonLayout';
    this.html = true;
    this.style = true;
    this.data = true;

    $$('override');
    this.loadData = async (base, ctx, el) => { // eslint-disable-line no-unused-vars
        this.data.now = await ServerDateTime.now(this.abortHandle('serverTime'));
        // note: by calling this.abort('serverTime') any long running service call 
        // can be aborted on choice here, otherwise if page load aborted in between 
        // cancelLoadData call will do it automatically for all such abortHandles
    };
});
