const { VueComponent } = ns('flair.ui');

/**
 * @name CommonHeader
 * @description Common Header Component
 */
$$('ns', '(auto)');
Class('(auto)', VueComponent, function() {
    let hostAsm = getAssembly(AppDomain.host());
    this.data = {
        poweredBy1: flair.info.name + ' ' + flair.info.version,
        poweredBy2: hostAsm.package + ' ' + hostAsm.version
    };

    this.i18n = {
        strings: "./strings.json"
    };    

    this.style = `
    .footer.bottom {
        position: absolute;
        bottom: 1rem;
        right: 1rem;
        font-size: 0.9em;  
    }    
    `;

    this.html = `
    <footer class="footer bottom">
        <div class="container">
            <span class="text-muted">{{ stuff(i18n('strings', 'poweredBy', 'powered by %1, %2'), poweredBy1, poweredBy2) }}</span>
        </div>
    </footer>
    `;
});
