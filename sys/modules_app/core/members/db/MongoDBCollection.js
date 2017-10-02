define([
    use('[Base]')
], (Base) => {
    /**
     * @class app.core.db.MongoDBCollection
     * @classdesc app.core.db.MongoDBCollection
     * @desc Collection wrapper for MongoDB operations on a collection.
     */    
    return Class('app.core.db.MongoDBCollection', Base, function(attr) {
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
        this.func('insertOne', (resolve, reject, document, options) => {
            try {
                let result = dbCollection.insertOne(document, options);
                result.insertedCount = 1;
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });

        attr('async');
        this.func('insertMany', (resolve, reject, documents, options) => {
            try {
                let result = dbCollection.insertMany(documents, options);
                result.insertedCount = result.insertedIds.length;
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });

        attr('async');
        this.func('updateOne', (resolve, reject, query, document, isUpsert = false, options) => {
            try {
                options = options || {};
                options.upsert = isUpsert;
                let result = dbCollection.updateOne(query, document, options);
                result.upsertedCount = (result.upsertedId ? 1 : 0);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });

        attr('async');
        this.func('updateMany', (resolve, reject, query, documents, isUpsert = false, options) => {
            try {
                options = options || {};
                options.upsert = isUpsert;
                let result = dbCollection.update(query, documents, options);
                result.upsertedCount = (result.upsertedId ? 1 : 0); // TODO: check, from documentation it looks it can always upsert only 1 document
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });

        attr('async');
        this.func('deleteOne', (resolve, reject, query, options) => {
            try {
                options = options || {};
                let result = {};
                if (!dbCollection.isCapped()) {
                    result = dbCollection.deleteOne(query, options); 
                } else {
                    // https://docs.mongodb.com/manual/reference/method/db.collection.deleteOne/#capped-collections
                    result = {
                        acknowledged: false, 
                        deletedCount: 0
                    }
                }
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });

        attr('async');
        this.func('deleteMany', (resolve, reject, query, options) => {
            try {
                options = options || {};
                let result = {};
                if (!dbCollection.isCapped()) {
                    result = dbCollection.deleteMany(query, options); 
                } else {
                    // https://docs.mongodb.com/manual/reference/method/db.collection.deleteOne/#capped-collections
                    result = {
                        acknowledged: false, 
                        deletedCount: 0
                    }
                }
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });

        attr('async');
        this.func('findOne', (resolve, reject, query, projection) => {
            try {
                let document = dbCollection.findOne(query, projection);
                resolve(document);
            } catch (err) {
                reject(err);
            }
        }); 
        
        attr('async');
        this.func('findMany', (resolve, reject, query, projection) => {
            try {
                let cursor = dbCollection.find(query, projection);
                resolve(cursor);
            } catch (err) {
                reject(err);
            }
        });

        attr('async');
        this.func('replaceOne', (resolve, reject, query, document, isUpsert = false, options) => {
            try {
                options = options || {};
                options.upsert = isUpsert;
                this.replaceOne(query, document, options).then(resolve).catch(reject);
            } catch (err) {
                reject(err);
            }
        });

        attr('async');
        this.func('count', (resolve, reject, query, options) => {
            try {
                resolve(dbCollection.count(query, options));
            } catch (err) {
                reject(err);
            }
        });                  
    });
});