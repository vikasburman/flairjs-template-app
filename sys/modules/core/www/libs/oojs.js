/**
 * oojs.js
 * version 1.0.0
 * (C) 2017, Vikas Burman
 * MIT License 
 */
(function() {
    // the definition
    const def = (opts = {}) => {
        let oojs = {},
            noop = () => {},
            noopAsync = (resolve, reject) => { resolve(); },
            isServer = ((typeof global === 'object' && typeof exports === 'object') ? true : false),
            options = {
                env: opts.env || (isServer ? 'server' : 'client'),
                global: (isServer ? global : window),
                supressGlobals: (typeof opts.supressGlobals === 'undefined' ? false : opts.supressGlobals),
                symbols: opts.symbols || []
            };

        // Class
        // Class(className, function() {})
        // Class(className, inherits, function() {})
        // Class(className, [mixins/interfaces], function() {})
        // Class(className, inherits, [mixins/interfaces], function() {})
        oojs.Class = (arg1, arg2, arg3, arg4) => {
            let className = arg1,
                inherits = null,
                mixins = [],
                interfaces = [],
                factory = null;
            if (typeof arg3 === 'function') {
                factory = arg3;
                if (Array.isArray(arg2)) {
                    mixins = arg2;
                } else {
                    inherits = arg2;
                }
            } else if (typeof arg4 === 'function') {
                inherits = arg2;
                mixins = arg3;
                factory = arg4;
            } else if (typeof arg2 === 'function') {
                factory = arg2;
            }

            // seperate mixins and interfaces
            let onlyMixins = [];
            for(let mixin of mixins) {
                switch (mixin._.type) {
                    case 'mixin': onlyMixins.push(mixin); break;
                    case 'interface': interfaces.push(mixin); break;
                }
            }
            mixins = onlyMixins;

            // build class definition
            let Class = function(_flag, _static, ...args) {
                let Parent = Class._.inherits,
                    _this = {},
                    _exposed_this = {},
                    singleInstance = null,
                    bucket = [],
                    meta = {},
                    props = {},
                    events = [],
                    classArgs = [],
                    isNeedProtected = false,
                    staticInterface = null,
                    theFlag = '__flag__',
                    mixin_being_applied = null;

                // singleton consideration
                singleInstance = Class._.singleInstance();
                if (singleInstance) { return singleInstance; }

                // classArgs and static
                if (_flag && _flag === theFlag) {
                    staticInterface = _static;
                    isNeedProtected = true;
                    classArgs = args;
                } else {
                    staticInterface = Class._.static;
                    if (typeof _flag !== 'undefined') { // as it can be a null value as well
                        classArgs = classArgs.concat([_flag]);
                        if (typeof _static !== 'undefined') { // as it can be a null value as well
                            classArgs = classArgs.concat([_static]);
                            if (typeof args !== 'undefined') { // as it can be a null value as well
                                classArgs = classArgs.concat(args);
                            }
                        }
                    } else {
                        classArgs = args;
                    }
                }

                // create parent instance
                if (Parent) {
                    _this = new Parent(theFlag, staticInterface, ...classArgs);
                    if (Parent._.isSealed() || Parent._.isSingleton()) {
                        throw `${className} cannot inherit from a sealed/singleton class ${Parent._.name}.`;
                    }
                }

                // definition helper
                const guid = () => {
                    return '_xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                };
                const isSingletonClass = () => {
                    return hasAttr('singleton', meta['_constructor']);
                }
                const isAbstractClass = () => {
                    return hasAttr('abstract', meta['_constructor']);
                };
                const isSpecialMember = (member) => {
                    return ['constructor', 'dispose', '_constructor', '_dispose', '_'].indexOf(member) !== -1;
                };   
                const isOwnMember = (member) => {
                    return typeof meta[member] !== 'undefined';
                };
                const isDerivedMember = (member) => {
                    if (isOwnMember(member)) { return false; }
                    return (_this._.instanceOf.findIndex((item) => {
                        return (item.meta[member] ? true : false);
                    }) !== -1);   
                };
                const isSealedMember = (member) => {
                    return hasAttr('sealed', meta[member]);
                }
                const isStaticMember = (member) => {
                    return hasAttr('static', meta[member]);
                }
                const isPrivateMember = (member) => {
                    return hasAttr('private', meta[member]);
                };
                const isHiddenMember = (member) => {
                    return hasAttr('hide', meta[member]);
                };
                const isProtectedMember = (member) => {
                    return hasAttrEx('protected', member);
                };
                const isSerializableMember = (member) => {
                    return hasAttrEx('serialize', member);
                };
                const isConditionalMemberOK = (member) => {
                    let isOK = true,
                        _meta = meta[member],
                        condition = '';
                    if (_meta) {
                        for(let item of _meta) {
                            if (item.name === 'conditional') {
                                isOK = false;
                                condition = (item.args && item.args.length > 0 ? item.args[0] : '');
                                switch(condition) {
                                    case 'server':
                                        isOK = (options.env === 'server'); break;
                                    case 'client':
                                        isOK = (options.env === 'client' || options.env === ''); break;
                                    default:
                                        isOK = options.symbols.indexOf(condition) !== -1; break;
                                }
                                break;                       
                            }
                        }
                    }
                    return isOK;
                };
                const doCopy = (member) => {
                    Object.defineProperty(_exposed_this, member, Object.getOwnPropertyDescriptor(_this, member));
                };            
                const isArrowFunction = (fn) => {
                    return (!(fn).hasOwnProperty('prototype'));
                }; 
                const attr = (attrName, ...args) => {
                    let Attr = null;
                    if (typeof attrName === 'string') {
                        Attr = oojs.Container.get(attrName)[0]; // get the first registered
                    } else {
                        Attr = attrName;
                        attrName = Attr._.name;
                    }
                    bucket.push({name: attrName, Attr: Attr, args: args});
                };                
                const getAttrArgs = (attrName, member) => {
                    let attrArgs = null;
                    for(let item of _this._.instanceOf) {
                        if (item.meta[member]) {
                            for(let attrItem of item.meta[member]) {
                                if (attrItem.name === attrName) {
                                    attrArgs = attrItem.args;
                                    break;
                                }
                            }
                            if (attrArgs) { break; }
                        }
                    }
                    return (attrArgs !== null ? attrArgs : []);
                };
                const applyAttr = (targetName) => {
                   let Attr = null,
                        targetType = meta[targetName].type,
                        attrArgs = null,
                        attrInstance = null,
                        decorator = null;
                    for(let info of meta[targetName]) {
                        Attr = info.Attr;
                        if (Attr) {
                            attrArgs = info.args || [];
                            attrInstance = new Attr(...attrArgs);
                            decorator = attrInstance.decorator();
                            if (typeof decorator === 'function') {
                                let descriptor = Object.getOwnPropertyDescriptor(_this, targetName);
                                decorator(_this, targetType, targetName, descriptor);
                                Object.defineProperty(_this, targetName, descriptor);
                            }
                        }
                    }
                };
                const hasAttr = (attrName, _meta) => {
                    let has = false;
                    if (_meta) {
                        has = (_meta.findIndex((item) => { return item.name === attrName; }) !== -1);
                    }
                    return has;
                };
                const hasAttrEx = (attrName, membe