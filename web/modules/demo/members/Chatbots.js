define([
    use('[Base]')
], (Base) => {
    /**
     * @class web.demo.Chatbots
     * @classdesc web.demo.Chatbots
     * @desc Chatbot demos controller.
     */
    return Class('web.demo.Chatbots', Base, function(attr) {
        attr('override');
        attr('singleton');
        this.func('constructor', (base) => {
            base();
        });

        attr('fetch', '/chatbots/', {
            responseDataType: 'json'
        });
        this.func('getDemos', (resolve, reject, response) => {
            if (response.isError) {
                reject(response.error);
            } else {
                let items = response.data;
                for(let item of items) {
                    item.url = '#/chatbots/' + item.name;
                    item.img = './images/demos/' + item.img;
                    item.isDisabled = !item.isAvailable;
                }
                resolve(items);
            }
        });

        attr('fetch', '/chatbots/:name', {
            responseDataType: 'json',
            pre: (args) => { args.url = { name: args.url }; }
        });
        this.func('getDemo', (resolve, reject, response) => {
            if (response.isError) {
                reject(response.error);
            } else {            
                let item = response.data;
                item.url = '#/chatbots/' + item.name;
                item.img = './images/demos/' + item.img;
                item.isDisabled = !item.isAvailable;
                resolve(item);
            }
        });
    });
});