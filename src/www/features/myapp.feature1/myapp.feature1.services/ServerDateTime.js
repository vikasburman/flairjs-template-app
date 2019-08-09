/**
 * @name ServerDateTime
 * @description ServerDateTime
 */
$$('ns', '(auto)');
$$('static');
Class('(auto)', function() {
    $$('fetch', 'get', 'json', '*R*/api/now', 'endPointPolicy1', 'cachePolicyType1');
    this.now = async (api) => {
        let result = await api() || { now: 'Could not connect to server.' };
        return result.now;
    };
});
