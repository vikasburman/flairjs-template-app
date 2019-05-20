const { VueLayout } = ns('flair.ui.vue');

/**
 * @name CommonLayout
 * @description Common Layout
 */
$$('ns', '(auto)');
Class('(auto)', VueLayout, function() {
    this.viewArea = 'view';
    this.areas = [
        { area: "header", component: "CommonHeader", type: "myapp.main.ui.CommonHeader" },
        { area: "footer", component: "CommonFooter", type: "myapp.main.ui.CommonFooter" },
    ];

    this.html = `
        <div>
            <div>[[header]]</div>
            <div>[[view]]</div>
            <div>[[footer]]</div>
        </div>
    `;
});
