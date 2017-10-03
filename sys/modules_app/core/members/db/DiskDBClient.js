define([
    use('[Base]'),
    use('fs-extra'),
    use('diskdb'),
    use('app.core.db.DiskDBCollection'),
    use('[IDbClient]')
], (Base, fs, diskdb, DiskDBCollection, IDbClient) => {
    /**
     * @class app.core.db.DiskDBClient
     * @classdesc app.core.db.DiskDBClient
     * @desc File system based database implementation that wraps the most common usage patterns of DiskDB.
     */    
    return Class('app.core.db.DiskDBClient', Base, [IDbClient], function(attr) {
        attr('override');
        attr('sealed');
        this.func('constructor', (base, dbName, options) => {
            base();
            
            // dbname
            this.name = dbName;

            // options
            this.options = options;

            // create db path, if does not exists
            if (!options.dbPath.endsWith('/')) { options.dbPath += '/'; }
            if (!fs.existsSync(options.dbPath)) { fs.ensureDirSync(options.dbPath); }
        });

        this.func('dispose', () => {
            this.disconnect();
        });

        attr('private');
        this.prop('options');    

        attr('readonly');
        this.prop('name');   

        let _db = null;
        attr('async');
        this.func('conn', (resolve, reject, isReconnect) => {
            if (_db === null || isReconnect) {
                this.disconnect();
                _db = diskdb.connect(this.options.dbPath);
            }
            resolve(_db);
        });
        
        attr('async');
        this.func('collection', (resolve, reject, collectionName) => {
            this.conn().then((db) => {
                if (!db[collectionName]) {
                    db.loadCollections([collectionName]);
                }
                try {
                    resolve(new DiskDBCollection(this.name, collectionName, db[collectionName]));
                } catch (err) {
                    reject(err);
                }
            }).catch(reject);
        });

        attr('async');
        this.func('create', (resolve, reject, collectionName, meta) => {
            this.conn().then((db) => {
                if (!db[collectionName]) {
                    db.loadCollections([collectionName]); // this will create if not exists
                }

                // create options collection for this collection
                let metaCollectionName = collectionName + '_meta';
                if (!db[metaCollectionName]) {
                    db.loadCollections([metaCollectionName]); // this will create if not exists
                }
                if (meta) {
                    db[metaCollectionName].save(meta);
                }

                // send collection back
                this.collection(collectionName).then(resolve).catch(reject);
            }).catch(reject);
        });

        attr('async');
        this.func('exists', (resolve, reject, collectionName) => {
            this.conn().then((db) => {
                let collectionFileName = options.dbPath + collectionName + '.json';
                if (fs.existsSync(collectionFileName)) { 
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(reject);             
        });

        attr('async');
        this.func('drop', (resolve, reject, collectionName) => {
            this.conn().then((db) => {
                if (!db[collectionName]) {
                    db.loadCollections([collectionName]);
                }
                db[collectionName].remove();

                // remove meta collection as well
                let metaCollectionName = collectionName + '_meta';
                if (!db[metaCollectionName]) {
                    db.loadCollections([metaCollectionName]);
                }
                db[metaCollectionName].remove();

                // check and return
                this.exists(collectionName).then(resolve).catch(reject);
            }).catch(reject);
        });

        this.func('disconnect', () => {
            _db = null;
        });

        let _tranHandle = null;
        this.func('beginTran', () => {
            if (_tranHandle === null) {
                // start transaction
                // not supported by diskDB
                _tranHandle = -1;
            }
        });
        this.func('commitTran', () => {
            if (_tranHandle !== null) {
                // commit transaction
                // not supported by diskDB
                _tranHandle = null;
            }
        });
        this.func('rollbackTran', () => {
            if (_tranHandle !== null) {
                // rollback transaction
                // not supported by diskDB
                _tranHandle = null;
            }
        });
    });
});