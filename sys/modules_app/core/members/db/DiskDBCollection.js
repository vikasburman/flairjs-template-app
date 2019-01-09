define([
    use('[Base]'),
    use('app.core.db.DiskDBCursor')
], (Base, DiskDBCursor) => {
    /**
     * @class app.core.db.DiskDBCollection
     * @classdesc app.core.db.DiskDBCollection
     * @desc Collection wrapper for diskdb operations on a collection.
     */    
    return Class('app.core.db.DiskDBCollection', Base, function(attr) {
        attr('override');
        attr('sealed');
        this.func('constructor', (base, dbName, collectionName, dbCollection) => {
            base();
            
            // dbname
            this.name = `${dbName}.${collectionName}`;

            // dbCollection
            this.dbCollection = dbCollection;
        });

        attr('private');
        this.prop('dbCollection');    

        attr('readonly');
        this.prop('name');   

        attr('async');
        this.func('insertOne', (resolve, reject, document) => {
            try {
                let items = this.dbCollection.save(document),
                    result = {
                        insertedId: items[0]._id,
                        insertedCount: 1
                    };
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });

        attr('async');
        this.func('insertMany', (resolve, reject, documents) => {
            try {
                let items = this.dbCollection.save(documents),
                    result = {
                        insertedIds: items.map((item) => { return item._id; }),
                        insertedCount: items.length
                    };
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });

        attr('async');
        this.func('updateOne', (resolve, reject, query, document, isUpsert = false) => {
            try {
                let options = {
                    multi: false,
                    upsert: isUpsert
                };
                let r = this.dbCollection.update(query, document, options),
                    result = {
                        matchedCount: r.updated,
                        modifiedCount: r.updated,
                        upsertedCount: r.inserted
                    };
                // TODO: check if upsertedId can be added here, as in MongoDBCient
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });

        attr('async');
        this.func('updateMany', (resolve, reject, query, documents, isUpsert = false) => {
            try {
                let options = {
                    multi: true,
                    upsert: isUpsert
                };
                let r = this.dbCollection.update(query, documents, options),
                    result = {
                        matchedCount: r.updated,
                        modifiedCount: r.updated,
                        upsertedCount: r.inserted
                    };
                // TODO: check if upsertedId can be added here, as in MongoDBCient
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });

        attr('async');
        this.func('deleteOne', (resolve, reject, query) => {
            try {
                let count = this.dbCollection.count();
                this.dbCollection.remove(query, false);
                let result = {
                    deletedCount: this.dbCollection.count() - count
                };
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });

        attr('async');
        this.func('deleteMany', (resolve, reject, query) => {
            try {
                let count = this.dbCollection.count();
                this.dbCollection.remove(query, true);
                let result = {
                    deletedCount: this.dbCollection.count() - count
                };
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });

        attr('async');
        this.func('findOne', (resolve, reject, query) => {
            try {
                let items = this.dbCollection.find(query),
                    document = items[0]; // first
                resolve(document);
            } catch (err) {
                reject(err);
            }
        });    
        
        attr('async');
        this.func('findMany', (resolve, reject, query) => {
            try {
                let items = this.dbCollection.find(query);
                resolve(new DiskDBCursor(items));
            } catch (err) {
                reject(err);
            }
        });

        attr('async');
        this.func('replaceOne', (resolve, reject, query, document, isUpsert = false) => {
            try {
                let newResult = {};
                this.deleteOne(query).then((deleteResult) => {
                    if (result.deletedCount === 0) {
                        if (isUpsert) {
                            this.updateOne(query, document, true).then((updateResult) => {
                                newResult = updateResult;
                                resolve(newResult);                                          
                            }).catch(reject);    
                        } else {
                            newResult = deleteResult;
                            newResult.matchedCount = deleteResult.deletedCount;
                            newResult.modifiedCount = 0;
                            resolve(newResult);                                       
                        }
                    } else {
                        this.insertOne(document).then((insertResult) => {
                            newResult = insertResult;
                            newResult.matchedCount = deleteResult.deletedCount;
                            newResult.modifiedCount = insertResult.insertedCount;
                            resolve(newResult);                                          
                        }).catch(reject);
                    }
                }).catch(reject);
            } catch (err) {
                reject(err);
            }
        });

        attr('async');
        this.func('count', (resolve, reject, query) => {
            try {
                this.findMany(query).then((cursor) => {
                    resolve(cursor.toArray().length);
                }).catch(reject);
            } catch (err) {
                reject(err);
            }
        });                
    });
});