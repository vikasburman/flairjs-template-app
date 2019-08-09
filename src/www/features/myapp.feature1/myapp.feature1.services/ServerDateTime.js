/**
 * @name ServerDateTime
 * @description ServerDateTime
 */
$$('ns', '(auto)');
$$('static');
Class('(auto)', function() {
    $$('fetch', 'get', 'json', '/**/api/now', 'cachePolicyType1');
    this.now = async (api) => {
        let result = await api() || { now: 'Could not connect to server.' };
        return result.now;
    };
});
