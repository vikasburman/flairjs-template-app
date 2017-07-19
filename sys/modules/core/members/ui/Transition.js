define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.ui.Transition
     * @classdesc sys.core.ui.Transition
     * @desc Transition base class with default transition.
     */    
    return Class('sys.core.ui.Transition', Base, function(attr) {
        this.func('in', ($new, $current = null) => {
            if ($current) { $current.style.display = 'none'; }
            $new.style.display = 'block';
        });
        this.func('out', ($current, $new = null) => {
            $current.style.display = 'none';
            if ($new) { $new.style.display = 'block'; }
        });
    });
});