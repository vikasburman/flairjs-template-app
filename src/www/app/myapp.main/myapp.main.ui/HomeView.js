const { VueView } = ns('flair.ui.vue');
const { CommonLayout } = await ns('myapp.main.ui', 'myapp.main.ui.CommonLayout');

/**
 * @name HomeView
 * @description Default Home View
 */
$$('ns', '(auto)');
Class('(auto)', VueView, function() {
    this.layout = new CommonLayout();

    this.title = "Home";

    this.data = {
        message: 'Hello World!'
    };

    this.html = `
    <div><h2>{{message}}</h2></div>
    `;
});
