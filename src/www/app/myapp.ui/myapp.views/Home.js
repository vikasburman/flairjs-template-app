const { VueView } = await ns('flair.ui');
const DateTimeService = await include('myapp.services.DateTimeService');

/**
 * @name HomeView
 * @description Default Home View
 */
Class('', VueView, function() {
    $$('override');
    this.preloadData = async (base, ctx) => { // eslint-disable-line no-unused-vars
        base(ctx);
        
        this.data.now = await DateTimeService.now();
    };
});
