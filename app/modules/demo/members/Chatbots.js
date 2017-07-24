define([
    use('[Base]'),
    use('sys.core.data.DiskDB')
], (Base, DiskDB) => {
    /**
     * @class app.demo.Chatbots
     * @classdesc app.demo.Chatbots
     * @desc Chatbots demo manager.
     */    
    return Class('app.demo.Chatbots', Base, function(attr) {
        attr('override');
        this.func('constructor', (base) => {
            base();
            let db = new DiskDB(use(this.settings('data.demoDB')));
            this.chatbots = db.getCollection('chatbots');
        });

        attr('private');
        this.prop('chatbots', null);

        this.func('getAll', (request) => {
            let list = this.chatbots.getAll();
            request.response.send.json(list);
        });
        this.func('getOne', (request) => {
            let item = this.chatbots.get({name: request.args.name});
            if (item) {
                request.response.send.json(item);
            } else {
                request.response.send.error(204, `${request.args.name} not found.`);
            }
        });
    });
});