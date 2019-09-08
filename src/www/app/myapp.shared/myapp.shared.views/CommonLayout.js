const { VueLayout } = await ns('flair.ui');

/**
 * @name CommonLayout
 * @description Common Layout
 */
Class('', VueLayout, function() {

    $$('override');
    this.construct = (base) => {
        base();
        
        this.viewArea = 'view';
    };

    this.areas = [
        { area: "header", component: "CommonHeader", type: "myapp.shared.views.CommonHeader" },
        { area: "footer", component: "CommonFooter", type: "myapp.shared.views.CommonFooter" },
    ];

    this.html = `
    [[header]]
    <div class="container">
        [[view]]
    </div>
    [[footer]]
    `;
});
