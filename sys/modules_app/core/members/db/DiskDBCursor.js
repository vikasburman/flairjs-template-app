define([
    use('[Base]')
], (Base) => {
    /**
     * @class app.core.db.DiskDBCursor
     * @classdesc app.core.db.DiskDBCursor
     * @desc Cursor for diskdb collection.
     */    
    return Class('app.core.db.DiskDBCursor', Base, function(attr) {
        attr('override');
        attr('sealed');
        this.func('constructor', (base, documents) => {
            base();
            
            // documents
            this.documents = documents;
        });

        attr('private');
        this.prop('documents');    

        attr('private');
        this.prop('index', 0);    

        this.func('skip', (count) => {
            this.documents = this.documents.slice(count);
            return this;
        });
        this.func('limit', (count) => {
            this.documents = this.documents.slice(0, count);
            return this;
        });
        this.func('hasNext', () => {
            if (index >= this.documents.length) {
                return false;
            }
            return true;
        });
        this.func('next', () => {
            if (this.hasNext()) {
                return this.documents[index++]; // pick from current index and then increase index
            }
            return null;
        });
        this.func('forEach', (iterator, callback) => {
            let success = true;
            for(let document of this.documents) {
                success = iterator(document);
                if (!success) { break; }
            }
            if (typeof callback === 'function') {
                callback(); // end-callback
            }
            return success;
        });
        this.func('map', (transform) => {
            let result = [];
            for(let document of this.documents) {
                result.push(transform(document));
            }
            return result;
        });
        this.func('toArray', () => {
            return this.documents.slice(0);
        });
    });
});