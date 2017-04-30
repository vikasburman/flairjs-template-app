define(() => {
    return class Base {

        // get value of given object's nested path 
        value(path, defaultValue = null) {
            var result = defaultValue,
                obj = this,
                index = -1,
                pathArray = path.split('.');
                length = pathArray.length;
            while (obj != null && ++index < length) {
                result = obj = obj[pathArray[index]];
            };
            return result;
        };
    };
});