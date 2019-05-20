const { VueView } = ns('flair.ui.vue');

/**
 * @name Error404View
 * @description Default Error View
 */
$$('ns', '(auto)');
Class('(auto)', VueView, function() {
    this.title = "Not Found";

    this.html = `
        <div><h2>Not Found</h2></div>
    `;
});
