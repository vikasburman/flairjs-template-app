const { RestHandler } = await ns('flair.api');
const DateTimeLogic = await include('myapp.model.DateTimeLogic');

/**
 * @name Now
 * @description Now endpoint
 */
Class('', RestHandler, function() {
    $$('override');
    this.onGet = async (base, ctx) => { 
        base(ctx);

        let dtl = new DateTimeLogic();
        return dtl.getCurrentTime(ctx.params.type || 'ms');
    };
});
