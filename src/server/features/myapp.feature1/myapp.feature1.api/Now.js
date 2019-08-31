const { RESTEndPoint } = await ns('flair.api');
const { CurrentTime } = await ns('myapp.feature1');

/**
 * @name Now
 * @description Now endpoint
 */
$$('ns', '(auto)');
Class('(auto)', RESTEndPoint, function() {
    $$('override');
    this.onGet = async (base, req, res) => { // eslint-disable-line no-unused-vars
        let curTime = new CurrentTime();
        res.json({ now: curTime.getCurrentTime() });
        return true; // handled
    };    
});
