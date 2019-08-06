const VueView = await include('flair.ui.vue.VueView');

/**
 * @name Error404View
 * @description Default Error View
 */
$$('ns', '(auto)');
Class('(auto)', VueView, function() {
    this.i18n = {
        titles: "./titles.json",
        strings: "./strings.json"
    };

    this.title = "Not Found";
    this.html = `
        <div><h2>{{ i18n('strings', 'notfound', 'Not Found') )}}</h2></div>
    `;

    $$('override');
    this.beforeLoad = async (base, ctx, el) => { // eslint-disable-line no-unused-vars
        this.title = this.i18n.titles.notfound || 'Not Found';
    };
});
