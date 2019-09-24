/**
 * @name DateTimeLogic
 * @description DateTimeLogic
 */
Class('', function() {
    this.getCurrentTime = (type = 'ms') => {
        let result = '';
        switch (type) {
            case 'ms': result = Date.now().toString(); break;
            case 'iso': result = new Date().toISOString(); break;
            case 'utc': result = new Date().toUTCString(); break;
            default: result = new Date().toJSON().toString(); break;
        }
        return result;
    };
});
