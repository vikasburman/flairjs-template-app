define(() => {
    return class Base {

        // get value of given object's nested path 
        get value(path, defaultValue = null) {
            var result = defaultValue,
                index = -1,
                pathArray = path.split('.');
                length = pathArray.length;
            while (this != null && ++index < length) {
                result = this = this[pathArray[index]];
            };
            return result;
        };

        // create an instance of whatever derived class this static method is being called
        static instance(...args) {
            let _class = this;
            return new _class(...args);
        }
    };
});