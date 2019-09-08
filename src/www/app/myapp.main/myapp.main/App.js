const { App } = await ns('flair.app');

/**
 * @name App
 * @description App
 */
Class('', App, function() {
    $$('override');
    this.onStart = async (base) => {
        base();

        // code to run on start of the app
    };

    $$('override');
    this.onReady = async (base) => {
        base();

        // code to run on ready of the app
    };    

    $$('override');
    this.onStop = async (base) => {
        base();

        // code to run on stop of the app
    };

    $$('override');
    this.onError = (base, err) => {
        base(err);

        // note: don't call base, if doing custom handling here
        // because base just throws the error as is, unless that 
        // is what you want
    };
});
