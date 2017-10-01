define([
    use('[Base]'),
    use('redis')
], (Base, redis) => {
    /**
     * @class app.core.cache.RedisCacheClient
     * @classdesc app.core.cache.RedisCacheClient
     * @desc Cache implementation that wraps the most common usage patterns of RedisCache.
     */
    return Class('app.core.cache.RedisCacheClient', Base, function(attr) {
        attr('override');
        attr('sealed');
        this.func('constructor', (base, groupName, options) => {
            base();

            // group name which will be prefixed to all keys
            this.name = groupName;

            // options
            // https://www.npmjs.com/package/redis#options-object-properties
            this.options = options;
        });

        this.func('dispose', () => {
            this.disconnect();
        });

        attr('private');
        this.prop('options');

        attr('readonly');
        this.prop('name');

        let _conn = null;
        attr('private');
        attr('async');
        this.func('conn', (resolve, reject) => {
            if (_conn === null) {
                _conn = redis.createClient(this.options);

                // setup
                _conn.on('error', reject);
                _conn.on('ready', () => {
                    resolve(_conn);
                });
            } else {
                resolve(_conn);
            }
        });

        attr('async');
        this.func('set', (resolve, reject, key, value, expireInSeconds) => {
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                conn.set(key, value, (err, reply) => {
                    if (!err) { 
                        if (expireInSeconds) {
                            conn.expire(key, expireInSeconds);
                        }
                        resolve(value); 
                    } else {
                        reject(err);
                    }
                });
            }).catch(reject);
        });

        attr('async');
        this.func('get', (resolve, reject, key, defaultValue) => {
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                conn.get(key, (err, value) => {
                    if (!err) { 
                        resolve(value); 
                    } else {
                        resolve(defaultValue);
                    }
                });
            }).catch(reject);
        });

        attr('async');
        this.func('del', (resolve, reject, key) => {
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                conn.del(key, (err, value) => {
                    if (!err) { 
                        resolve(); 
                    } else {
                        reject();
                    }
                });
            }).catch(reject);
        });

        attr('async');
        this.func('exists', (resolve, reject, key) => {
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                conn.exists(key, (err, reply) => {
                    if (!err) { 
                        if (reply === 1) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    } else {
                        reject();
                    }
                });
            }).catch(reject);
        });

        attr('async');
        this.func('setCounter', (resolve, reject, key, value, expireInSeconds) => {
            // value must be an integer
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                conn.set(key, value, (err, reply) => {
                    if (!err) { 
                        if (expireInSeconds) {
                            conn.expire(key, expireInSeconds);
                        }
                        resolve(value); 
                    } else {
                        reject(err);
                    }
                });
            }).catch(reject);
        });

        attr('async');
        this.func('getCounter', (resolve, reject, key, defaultValue) => {
            // defaultValue must be an integer
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                conn.get(key, (err, value) => {
                    if (!err) { 
                        resolve(value); 
                    } else {
                        resolve(defaultValue);
                    }
                });
            }).catch(reject);
        });

        attr('async');
        this.func('changeCounter', (resolve, reject, key, byValue = 1) => {
            // byValue must be an integer (positive or negative)
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                if (byValue > 0) {
                    conn.incrby(key, byValue, (err, newValue) => {
                        if (!err) { 
                            resolve(newValue); 
                        } else {
                            reject(err);
                        }
                    });
                } else if (byValue < 0) {
                    conn.decrby(key, byValue, (err, newValue) => {
                        if (!err) { 
                            resolve(newValue); 
                        } else {
                            reject(err);
                        }
                    });
                } else { // read current value
                    conn.get(key, (err, value) => {
                        if (!err) { 
                            resolve(value); 
                        } else {
                            resolve(defaultValue);
                        }
                    });
                }
            }).catch(reject);
        });        

        attr('async');
        this.func('get', (resolve, reject, key, defaultValue) => {
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                conn.get(key, (err, value) => {
                    if (!err) { 
                        resolve(value); 
                    } else {
                        resolve(defaultValue);
                    }
                });
            }).catch(reject);
        });

        attr('async');
        this.func('setField', (resolve, reject, key, field, value) => {
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                conn.hset(key, field, value, (err, reply) => {
                    if (!err) { 
                        resolve(value); 
                    } else {
                        reject(err);
                    }
                });
            }).catch(reject);
        }); 

        attr('async');
        this.func('getField', (resolve, reject, key, field, defaultValue) => {
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                conn.hget(key, field, (err, value) => {
                    if (!err) { 
                        resolve(value); 
                    } else {
                        resolve(defaultValue);
                    }
                });
            }).catch(reject);
        });     
        
        attr('async');
        this.func('delField', (resolve, reject, key, field) => {
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                conn.hdel(key, field, (err, value) => {
                    if (!err) { 
                        resolve(); 
                    } else {
                        reject();
                    }
                });
            }).catch(reject);
        });           

        attr('async');
        this.func('getFields', (resolve, reject, key, fields, defaultValue) => {
            // fields is an array of fields whose value is required in result
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                conn.hmget(key, fields, (err, values) => {
                    if (!err) { 
                        // values will be a list of values for passed fields that exist in hash
                        resolve(values); 
                    } else {
                        resolve(defaultValue);
                    }
                });
            }).catch(reject);
        }); 

        attr('async');
        this.func('getFieldsList', (resolve, reject, key, defaultValue) => {
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                conn.hkeys(key, (err, fields) => {
                    if (!err) { 
                        // fields will be a list of keys that exist in hash
                        resolve(fields); 
                    } else {
                        resolve(defaultValue);
                    }
                });
            }).catch(reject);
        }); 

        attr('async');
        this.func('setHash', (resolve, reject, key, hash, expireInSeconds) => {
            // hash must be a key:value pair object one level deep only
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                conn.hmset(key, hash, (err, reply) => {
                    if (!err) { 
                        if (expireInSeconds) {
                            conn.expire(key, expireInSeconds);
                        }                        
                        resolve(hash); 
                    } else {
                        reject(err);
                    }
                });
            }).catch(reject);
        }); 
               
        attr('async');
        this.func('getHash', (resolve, reject, key, defaultValue) => {
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                conn.hgetall(key, (err, hash) => {
                    if (!err) { 
                        // hash will be a key:value pair object one level deep
                        resolve(hash); 
                    } else {
                        resolve(defaultValue);
                    }
                });
            }).catch(reject);
        }); 

        attr('async');
        this.func('setList', (resolve, reject, key, list, expireInSeconds) => {
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                let fullList = [key, ...list]
                conn.rpush(fullList, (err, reply) => {
                    if (!err) { 
                        if (expireInSeconds) {
                            conn.expire(key, expireInSeconds);
                        }                        
                        resolve(list);
                    } else {
                        reject(err);
                    }
                });
            }).catch(reject);
        }); 
               
        attr('async');
        this.func('getList', (resolve, reject, key, defaultValue) => {
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                conn.lrange(key, 0, -1, (err, list) => {
                    if (!err) { 
                        resolve(list); 
                    } else {
                        resolve(defaultValue);
                    }
                });
            }).catch(reject);
        }); 

        attr('async');
        this.func('getListItems', (resolve, reject, key, start, stop, defaultValue) => {
            // start and stop are offset indexes
            this.conn().then((conn) => {
                key = `${this.name}.${key}`;
                conn.lrange(key, (err, list) => {
                    if (!err) { 
                        resolve(list); 
                    } else {
                        resolve(defaultValue);
                    }
                });
            }).catch(reject);
        }); 
        
        this.func('disconnect', () => {
            if (_conn !== null) {
                // disconnect
                _conn.quit();
                _conn = null;
            }
        });
    });
});