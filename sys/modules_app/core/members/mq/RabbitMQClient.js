define([
    use('[Base]'),
    use('amqp')
], (Base, amqp) => {
    /**
     * @class app.core.mq.RabbitMQClient
     * @classdesc app.core.mq.RabbitMQClient
     * @desc Message queue implementation that wraps the most common usage patterns of RabbitMQ.
     */
    return Class('app.core.mq.RabbitMQClient', Base, function(attr) {
        attr('override');
        attr('sealed');
        this.func('constructor', (base, exchangeName, options) => {
            base();

            // exchange name
            this.name = exchangeName;
                        
            // options is a collective object having options for connection and amqp implementation
            // options and implOptions are: https://www.npmjs.com/package/amqp#connection-options-and-url
            this.options = options;
            if (this.options.implOptions) {
                this.implOptions = this.options.implOptions;
                delete this.options.implOptions;
            }
        });

        this.func('dispose', () => {
            this.disconnect();
        });

        attr('private');
        this.prop('options');

        attr('private');
        this.prop('implOptions');

        attr('readonly');
        this.prop('name');

        let _conn = null,
            _exch = null;
        attr('private');
        attr('async');
        this.func('conn', (resolve, reject, isReconnect) => {
            if (_exch === null || isReconnect) {
                this.disconnect();
                if (this.implOptions) {
                    _conn = amqp.createConnection(this.options, this.implOptions);
                } else {
                    _conn = amqp.createConnection(this.options);
                }

                // setup
                _conn.on('error', reject);
                _conn.on('ready', () => {
                    // https://www.npmjs.com/package/amqp#connectionexchangename-options-opencallback
                    // options chosen for topic messaging
                    _exch = _conn.exchange(this.name, {
                        type: 'topic',
                        passive: false,
                        confirm: true,
                        durable: true,
                        autoDelete: true,
                        noDeclare: false
                    });
                    resolve({conn: _conn, exch: _exch});
                });
                _conn.connect(); // initiate connection
            } else {
                resolve({conn: _conn, exch: _exch});
            }
        });

        this.func('message', (data) => {
            // https://www.npmjs.com/package/amqp#exchangepublishroutingkey-message-options-callback
            let msg = {};
            msg.data = data;
            msg.options = {
                messageId: new Base()._.id,
                timestamp: Date.now(),
                mandatory: true,
                immediate: false,
                deliveryMode: 2, // persistent
                priority: 5,
                appId: (App ? App.info.id : '')
            };
            msg.setHeader = (key, value) => {
                msg.options.headers = msg.options.headers || {};
                msg.options.headers[key] = value;
            };
            msg.setPriority = (level) => { msg.priority = level; }
            msg.setContentType = (type, encoding) => {
                msg.options.contentType = type;
                if (encoding) {
                    msg.options.contentEncoding = encoding;
                }
            };
            return msg;
        });

        attr('async');
        this.func('publish', (resolve, reject, topic, msg) => {
            this.conn().then((obj) => {
                topic = this.name + (topic ? '.' + topic : '');
                obj.exch.publish(topic, msg.data, msg.options, (success) => {
                    if (success) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            }).catch(reject);
        });

        attr('async');
        this.func('subscribe', (resolve, reject, topic, topicPattern, asyncFn) => {
            this.conn().then((obj) => {
                obj.conn.queue(topic, (mq) => {
                    let fn = asyncFn;
                    topicPattern = this.name + (topicPattern ? '.' + topicPattern : '');
                    mq.bind(obj.exch, topicPattern);
                    mq.subscribe({ ack: true }, (message, headers, deliveryInfo, messageObject) => {
                        fn(message.data).then(() => {
                            mq.shift();
                        }).catch(() => {
                            mq.shift(true, true);
                        });                    
                    }).addCallback((e) => { resolve(e.consumerTag); });
                });
            }).catch(reject);
        });

        this.func('unsubscribe', (qName, handle) => {
            this.conn().then((obj) => {
                obj.conn.queue(qName, (mq) => {
                    mq.unsubscribe(handle);
                });
            }).catch(reject);
        });

        this.func('disconnect', () => {
            if (_exch !== null) {
                // destroy exchange
                try {
                    _exch.destroy(true);
                    _conn.disconnect();
                    _exch = null;
                    _conn = null;
                } catch (err) {
                    // ignore as exchange could not be destroyed
                }
            }
        });
    });
});