const VueView = await include('flair.ui.vue.VueView');
const CommonLayout = await include('myapp.shared.ui.CommonLayout');

/**
 * @name HomeView
 * @description Default Home View
 */
$$('ns', '(auto)');
Class('(auto)', VueView, function() {
    this.layout = new CommonLayout();

    this.i18n = {
        titles: "./titles.json",
        strings: "./strings.json"
    };

    this.title = "Home";
    this.data = {
        now: ''
    };

    this.html = `
    <div><h2>{{ i18n('strings', 'hello', 'Hello World!') }}</h2><p>Current server time is: {{ now }}</p></div>
    `;

    $$('fetch', 'get', 'json', '/**/api/*/now');
    this.now = async (api) => {
        let result = await api() || { now: 'Could not connect to server.' };
        return result.now;
    };

    $$('override');
    this.beforeLoad = async (base, ctx, el) => { // eslint-disable-line no-unused-vars
        this.title = this.i18n.titles.home || 'Home';

        this.data.now = await this.now();
    };
});
