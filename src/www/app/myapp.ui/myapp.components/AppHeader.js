const { VueComponent } = await ns('flair.ui');

/**
 * @name Header
 * @description Common header component
 */
Class('', VueComponent, function() {
    $$('override');
    this.preloadData = async (base, ctx) => {
        base(ctx);
        
        this.data = {
            title: flair.info.title
        };
    };    
});
