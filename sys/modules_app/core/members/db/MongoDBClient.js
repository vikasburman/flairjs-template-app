define([
    use('[Base]'),
    use('mongodb')
], (Base, mongodb) => {
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
        attr('private');
        attr('async');
        this.func('conn', (resolve, reject) => {
            if (_db === null) {
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
                if (!db[collectionName]) {
                    db.loadCollections([collectionName]);
                }

                // collection class
                // https://www.npmjs.com/package/diskdb
                let Collection = function(dbName, collectionName, dbCollection) {
                    this.name = () => { return `${dbName}.${collectionName}`; }
                    this.count = () => { return dbCollection.count(); }

                    this.insertOne = (document) => {
                        return new Promise((resolve, reject) => {
                            let items = dbCollection.save(document),
                                result = {
                                    insertedCount: items.length
                                };
                            resolve(result);
                        });
                    };
                    this.insertMany = (documents) => {
                        return new Promise((resolve, reject) => {
                            let items = dbCollection.save(documents),
                                result = {
                                    insertedCount: items.length
                                };
                            resolve(result);
                        });
                    };
                    this.updateOne = (query, document, isUpsert = false) => {
                        let options = {
                            multi: false,
                            upsert: isUpsert
                        };
                        return new Promise((resolve, reject) => {
                            let r = dbCollection.update(query, document, options),
                                result = {
                                    matchedCount: r.updated,
                                    modifiedCount: r.updated,
                                    upsertedCount: r.inserted
                                };
                            resolve(result);
                        });
                    };
                    this.updateMany = (query, documents, isUpsert = false) => {
                        let options = {
                            multi: true,
                            upsert: isUpsert
                        };
                        return new Promise((resolve, reject) => {
                            let r = dbCollection.update(query, documents, options);
                                result = {
                                    matchedCount: r.updated,
                                    modifiedCount: r.updated,
                                    upsertedCount: r.inserted
                                };
                            resolve(result);
                        });
                    };
                    this.deleteOne = (query) => {
                        return new Promise((resolve, reject) => {
                            let count = dbCollection.count();
                            dbCollection.remove(query, false);
                            let result = {
                                deletedCount: dbCollection.count() - count
                            };
                            resolve(result);
                        });
                    };
                    this.deleteMany = (query) => {
                        return new Promise((resolve, reject) => {
                            let count = dbCollection.count();
                            dbCollection.remove(query, true);
                            let result = {
                                deletedCount: dbCollection.count() - count
                            };
                            resolve(result);
                        });
                    };
                    this.findOne = (query, skip = 0) => {
                        return new Promise((resolve, reject) => {
                            let items = dbCollection.find(query),
                                document = items.slice(skip, skip + 1);
                            resolve(document);
                        });
                    };                       
                    this.findMany = (query, limit = -1, skip = 0) => {
                        return new Promise((resolve, reject) => {
                            // get documents
                            let items = dbCollection.find(query),
                                uptoIndex = (limit === -1 ? a.length : (skip + limit)),
                                filteredItems = items.slice(skip, uptoIndex);

                            // stream class
                            let DocumentStream = function(documents) {
                                this.each = (fn) => {
                                    forAsync(documents, (_resolve, _reject, document) => {
                                        fn(document).then(_resolve).catch(_reject);
                                    }).then(() => {
                                        // nothing specific
                                    }).catch(() => {
                                        // nothing specific
                                    });
                                };
                                this.toArray = () => {
                                    return documents.slice(0);
                                };
                            };

                            // stream
                            let stream = new DocumentStream(filteredItems);

                            // done
                            resolve(stream);
                        });
                    };
                    this.replaceOne = (query, document) => {
                        return new Promise((resolve, reject) => {
                            this.deleteOne(query).then((result) => {
                                this.insertOne(document).then(resolve).catch(reject);
                            }).catch(reject);
                        });
                    };
                };

                // collection object
                resolve(new Collection(this.name, collectionName, db[collectionName]));
            }).catch(reject);
        });

        attr('async');
        this.func('create', (resolve, reject, collectionName, meta) => {
            this.conn().then((db) => {
                db.createCollection(collectionName, meta, (err, results) => {
                    
                })
                if (!db[collectionName]) {
                    db.loadCollections([collectionName]); // this will create if not exists
                }

                // create options collection for this collection
                let metaCollectionName = collectionName + '_meta';
                if (!db[metaCollectionName]) {
                    db.loadCollections([metaCollectionName]); // this will create if not exists
                }

                // store meta
                if (meta) {
                    db[metaCollectionName].save(meta);
                }

                resolve();
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

                // done
                resolve();
            }).catch(reject);
        });

        this.func('disconnect', () => {
            _db = null;
        });
    });
});