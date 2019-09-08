const { VueComponent } = await ns('flair.ui');

/**
 * @name CommonHeader
 * @description Common Header Component
 */
Class('', VueComponent, function() {
    this.data = {
        title: flair.info.title
    };

    this.html = `
    <header>
        <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
            <span class="navbar-brand">{{title}} App</span>
        </nav>
    </header>
    `;
});
