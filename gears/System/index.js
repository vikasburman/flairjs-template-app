define([
    'System.Base',
    'System.Module'
], (Base, Module) => {
    class System extends Module {
        get Base() { return Base; };
        get Module() { return Module; };
    };

    return System.instance();
});