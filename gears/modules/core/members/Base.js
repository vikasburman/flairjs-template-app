define(() => {
    return class Base {
        // get value of given object's nested path 
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