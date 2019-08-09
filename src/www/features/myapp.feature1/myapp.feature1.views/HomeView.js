const VueView = await include('flair.ui.vue.VueView');
const CommonLayout = await include('myapp.shared.views.CommonLayout');
const { ServerDateTime } = ns('myapp.feature1.services');

/**
 * @name HomeView
 * @description Default Home View
 */
$$('ns', '(auto)');
Class('(auto)', VueView, function() {
    this.title = "Home";
    this.layout = new CommonLayout();
    this.i18n = {
        titles: "./titles.json",
        strings: "./strings.json"
    };
    this.html = './HomeView/index.html';
    this.style = './HomeView/styles.css';
    this.data = {
        now: 'loading...'
    };

    $$('override');
    this.beforeLoad = async (base, ctx, el) => { // eslint-disable-line no-unused-vars
        this.title = this.i18n.titles.home || 'Home';
    };

    $$('override');
    this.loadData = async (base, ctx, el) => { // eslint-disable-line no-unused-vars
        this.data.now = await ServerDateTime.now(this.abortHandle());
        // note: save result of abortHandle (which is an instance of AbortController) to cancel
        // on choice here, otherwise cancelLoadData call will do it automatically
    };
});
