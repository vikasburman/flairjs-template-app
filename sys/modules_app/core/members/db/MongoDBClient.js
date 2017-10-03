define([
    use('[Base]'),
    use('mongodb'),
    use('app.core.db.MongoDBCollection')
], (Base, mongodb, MongoDBCollection) => {
    /**
     * @class app.core.db.MongoDBClient
     * @classdesc app.core.db.MongoDBClient
     * @desc Document based database implementation that wraps the most common usage patterns of MongoDB.
     */    
    return Class('app.core.db.MongoDBClient', Base, function(attr) {
        attr('override');
        attr('sealed');
        this.func('constructor', (base, dbName, options) => {
            base();
            
            // dbname
            this.name = dbName;

            // options
            this.options = options;
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
                mongodb.MongoClient.connect(this.options.url, (err, db) => {
                    if (!err) {
                        _db = db;
                        resolve(_db);
                    } else {
                        reject(err);
                    }
                });
            } else {
                resolve(_db);
            }
        });

        attr('async');
        this.func('collection', (resolve, reject, collectionName) => {
            this.conn().then((db) => {
                try {
                    resolve(new MongoDBCollection(this.name, collectionName, db.collection(collectionName)));
                } catch (err) {
                    reject(err);
                }
            }).catch(reject);
        });

        attr('async');
        this.func('create', (resolve, reject, collectionName, meta) => {
            this.conn().then((db) => {
                db.createCollection(collectionName, meta, (err, results) => {
                    if (!err) {
                        // send collection back
                        this.collection(collectionName).then(resolve).catch(reject);
                    } else {
                        reject(err);
                    }
                });
            }).catch(reject);
        });

        attr('async');
        this.func('exists', (resolve, reject, collectionName) => {
            this.conn().then((db) => {
                if (db.getCollectionNames().indexOf(collectionName) !== -1) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(reject);             
        });
        
        attr('async');
        this.func('drop', (resolve, reject, collectionName) => {
            this.conn().then((db) => {
                db.collection(collectionName).drop();

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
                // not supported by mongoDB
                _tranHandle = -1;
            }
        });
        this.func('commitTran', () => {
            if (_tranHandle !== null) {
                // commit transaction
                // not supported by mongoDB
                _tranHandle = null;
            }
        });
        this.func('rollbackTran', () => {
            if (_tranHandle !== null) {
                // rollback transaction
                // not supported by mongoDB
                _tranHandle = null;
            }
        });        
    });
});