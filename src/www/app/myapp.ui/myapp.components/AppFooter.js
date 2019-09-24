const { VueComponent } = await ns('flair.ui');

/**
 * @name Footer
 * @description Common footer component
 */
Class('', VueComponent, function() {
    $$('override');
    this.preloadData = async (base, ctx) => {
        base(ctx);
        
        let hostAsm = getAssembly(AppDomain.host());

        this.data = {
            poweredBy1: flair.info.name + ' ' + flair.info.version,
            poweredBy2: hostAsm.package + ' ' + hostAsm.version
        };
    };
});
