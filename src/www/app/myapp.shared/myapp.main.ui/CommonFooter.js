const { VueComponent } = ns('flair.ui.vue');

/**
 * @name CommonHeader
 * @description Common Header Component
 */
$$('ns', '(auto)');
Class('(auto)', VueComponent, function() {
    this.data = {
        copyright: flair.info.copyright 
    };

    this.html = `
        <div>{{copyright}}</div>
    `;
});
