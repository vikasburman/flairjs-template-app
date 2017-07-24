define([
    use('sys.core.ui.View'),
    use('web.demo.shells.Empty'),
    use('[CredentialsCreator]'),
    use('[Auth]')
], (View, Shell, CredentialsCreator, Auth) => {
    /**
     * @class web.demo.views.Login
     * @classdesc web.demo.views.Login
     * @desc Access control for a chatbot.
     */
    return Class('web.demo.views.Login', View, function(attr) {
        attr('override');
        this.func('constructor', (base) => {
            base(Shell);
            this.data.title = 'Login To Continue';
        });

        attr('override');
        attr('async');
        this.func('afterShow', (base, resolve, reject) => {
            base().then(() => {
                this.env.loadScript('https://www.google.com/recaptcha/api.js').then(resolve).catch(reject);
            }).catch(reject);
        });

        attr('async');
        this.func('login', (resolve, reject, loginId, pwd) => {
            let credentialsCreator = new CredentialsCreator(),
                auth = new Auth();
            auth.login(credentialsCreator.create(loginId, pwd)).then(resolve).catch(reject);
        });

        this.data('error', '');
        this.data('email', '');
        this.data('pwd', '');
        this.handler('go', () => {
            if (!this.data.email && !this.data.pwd) {
                this.data.error = 'Both email id and password must be provided.';
                return;
            } 
            if (typeof grecaptcha !== 'undefined') {
                let response = grecaptcha.getResponse();
                if (!response) {
                    this.data.error = 'Captcha must be solved.';
                    return;
                }
            }
            
            // validate
            this.data.error = '';
            this.login(this.data.email, this.data.pwd).then(() => {
                this.redirect();
            }).catch((err) => {
                if (err === 401) {
                    this.data.error = `Invalid email id or password.`;
                } else {
                    this.data.error = `Error validating credentials: (${err})`;
                }
            });
        });
    });
});