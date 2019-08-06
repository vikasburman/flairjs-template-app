const RESTEndPoint = await include('flair.api.RESTEndPoint');

/**
 * @name Now
 * @description Now service
 */
$$('ns', '(auto)');
Class('(auto)', RESTEndPoint, function() {
    $$('override');
    this.onGet = async (base, req, res) => { // eslint-disable-line no-unused-vars
        res.json({ now: Date.now().toString() });
        return true; // handled
    };    
});
