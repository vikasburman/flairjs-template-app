define(() => {
    /**
     * Root of all framework and app classes.
     */    
    return class Base {
        /**
         * get value of given object's nested property 
         * @param {string} keyPath - path string representing nested property to read
         * @example
         * 'prop1.prop11.prop111'
         * @param {any} defaultValue - value to return if key not found
         * @return {any} value of the requested property
         */
        value(keyPath = '', defaultValue = null) {
            var obj = this,
                result = defaultValue,
                index = -1,
                pathArray = keyPath.split('.'),
                length = pathArray.length;
            while (obj != null && ++index < length) {
                result = obj = obj[pathArray[index]];
            };
            if (typeof result === 'undefined') { result = defaultValue; }
            return result;
        };
    };
});