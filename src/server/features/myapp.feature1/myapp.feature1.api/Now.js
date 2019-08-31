const { RESTEndPoint } = await ns('flair.api');
const CurrentTime = await include('myapp.feature1.CurrentTime');

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
