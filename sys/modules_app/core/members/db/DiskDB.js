define([
    use('[Base]'),
    use('fs-extra | '),
    use('diskdb | ')
], (Base, fs, diskdb) => {
    /**
     * @class app.core.db.DiskDB
     * @classdesc app.core.db.DiskDB
     * @desc DiskDB access (for server as of now)
     */    
    return Class('app.core.db.DiskDB', Base, function(attr) {
        attr('override');
        attr('sealed');
        this.func('constructor', (base, dbPath) => {
            base();
            if (!this.env.isServer) { throw 'DiskDB implementation is available for server usage only.'; }
            
            // create db path, if does not exists
            if (!dbPath) { throw 'DiskDB path must be specified.'; }
            this.dbPath = dbPath;
            if (!fs.existsSync(dbPath)) { fs.ensureDirSync(dbPath); }
        });

        let _db = null;
        attr('private');
        this.prop('db', () => {
            if (_db === null) {
                _db = diskdb.connect(this.dbPath);
            }
            return _db;
        });

        attr('private');
        this.func('collection', (collectionName) => {
           if (!this.db[collectionName]) {
                this.db.loadCollections([collectionName]);
            }
            return this.db[collectionName];         
        });

        attr('readonly');
        this.prop('dbPath', '');    

        this.func('getCollection', (collectionName) => {
            return Object.freeze({
                db: this.dbPath,
                collection: collectionName,
                insert: (data) => { return this.insert(collectionName, data); },
                update: (query, data, options) => { return this.update(collectionName, query, data, options); },
                remove: (query, options) => { return this.remove(collectionName, query, options); },
                count: () => { return this.count(collectionName); },
                get: (query) => { return this.get(collectionName, query); },
                getAll: (query) => { return this.getAll(collectionName, query); }
            });
        });
        this.func('insert', (collectionName, data) => {
            return this.collection(collectionName).save(data);
        });
        this.func('update', (collectionName, query, data, options) => {
            return this.collection(collectionName).update(query, data, options);
        });
        this.func('remove', (collectionName, query, options) => {
            let multi = true;
            if (options && typeof options.multi !== 'undefined') {
                multi = options.multi;
            }
            return this.collection(collectionName).remove(query, multi);
        });
        this.func('count', (collectionName) => {
            return this.collection(collectionName).count();
        });
        this.func('get', (collectionName, query) => {
            return this.collection(collectionName).findOne(query);
        });
        this.func('getAll', (collectionName, query) => {
            return this.collection(collectionName).find(query);
        });
    });
});