const { VueComponent } = ns('flair.ui.vue');

/**
 * @name CommonHeader
 * @description Common Header Component
 */
$$('ns', '(auto)');
Class('(auto)', VueComponent, function() {
    this.data = {
        title: flair.info.title
    };

    this.html = `
    <header>
        <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
            <span class="navbar-brand">{{title}} Firebase App</span>
        </nav>
    </header>
    `;
});
