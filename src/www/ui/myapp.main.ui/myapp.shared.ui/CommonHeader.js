const { VueComponent } = ns('flair.ui.vue');

/**
 * @name CommonHeader
 * @description Common Header Component
 */
$$('ns', '(auto)');
Class('(auto)', VueComponent, function() {
    this.data = {
        title: flair.info.title,
        version: flair.info.version
    };

    this.html = `
        <div>{{title}} - v{{version}}</div>
    `;
});
