/**
 * @name DateTimeService
 * @description DateTimeService
 */
$$('static');
Class('', function() {
    $$('cache', 10000);
    $$('fetch', 'app-server', 'get-json', '/now');
    this.now = async (api) => {
        let result = await api();
        if (!result.isError) { return result.data.now; }
        return 'Could not connect to server.';
    };
});
