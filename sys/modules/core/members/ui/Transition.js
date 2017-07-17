define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.ui.Transition
     * @classdesc sys.core.ui.Transition
     * @desc Transition base class with default transition.
     */    
    return Class('sys.core.ui.Transition', Base, function(attr) {
        this.func('in', (newView, currentView = null) => {
            if (currentView) { currentView._.$el.style.display = 'none'; }
            newView._.$el.style.display = 'block';
        });
        this.func('out', (currentView, newView = null) => {
            currentView._.$el.style.display = 'none';
            if (newView) { newView._.$el.style.display = 'block'; }
        });
    });
});