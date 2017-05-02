// global: use()
describe('globel use() function', () => {
    describe('when used on server to resolve node module path', () => {
        it('should give value as is', () => {
            expect(use('fs', 'server')).toEqual('fs');
        });
    });
    describe('when used on client to resolve node module path', () => {
        it('should give value as is', () => {
            expect(use('fs', 'client')).toEqual('fs');
        });
    });

    describe('when used on server to resolve relative files path', () => {
        it('should give value as is', () => {
            expect(use('./file1.ext', 'server')).toEqual('./file1.ext');
            expect(use('../file1.ext', 'server')).toEqual('../file1.ext');
            expect(use('../../file1.ext', 'server')).toEqual('../../file1.ext');
        });
    });   
    describe('when used on client to resolve relative files path', () => {
        it('should give value as is', () => {
            expect(use('./file1.ext', 'client')).toEqual('./file1.ext');
            expect(use('../file1.ext', 'client')).toEqual('../file1.ext');
            expect(use('../../file1.ext', 'client')).toEqual('../../file1.ext');
        });
    });   

    describe('when used on server to resolve namespaced packaged module path', () => {
        it('should resolve to module member file path', () => {
            expect(use('sys.core.Base', 'server')).toContain(config.source.sys + 'core/members/Base.js');
            expect(use('app.core.Base', 'server')).toContain(config.source.app + 'core/members/Base.js');
            expect(use('api.core.Base', 'server')).toContain(config.source.api + 'core/members/Base.js');
            expect(use('web.core.Base', 'server')).toContain(config.source.web + 'core/members/Base.js');                                    
        });
    });   
    describe('when used on client to resolve namespaced packaged module path', () => {
        it('should resolve to module id as is', () => {
            expect(use('sys.core.Base', 'client')).toEqual('sys.core.Base');
            expect(use('app.core.Base', 'client')).toEqual('app.core.Base');
            expect(use('api.core.Base', 'client')).toEqual('api.core.Base');
            expect(use('web.core.Base', 'client')).toEqual('web.core.Base');                        
        });
    });

    describe('when used on server to resolve namespaced packaged mock-enabled module path', () => {
        it('should resolve to module member mock file path', () => {
            expect(use('~sys.core.Base', 'server')).toContain(config.source.sys + 'core/members/Base.mock.js');                                   
        });
    });   
    describe('when used on client to resolve namespaced packaged mock-enabled module path', () => {
        it('should resolve to module id as is', () => {
            expect(use('~sys.core.Base', 'client')).toEqual('sys.core.Base');
        });
    });

    describe('when used on server to resolve namespaced packaged files path', () => {
        it('should resolve to correctly rooted path of given file', () => {
            expect(use('sys/core/assets/file1.ext', 'server')).toContain(config.source.sys + 'core/assets/file1.ext');
            expect(use('app/core/assets/file1.ext', 'server')).toContain(config.source.app + 'core/assets/file1.ext');
            expect(use('api/core/assets/file1.ext', 'server')).toContain(config.source.api + 'core/assets/file1.ext');
            expect(use('web/core/assets/file1.ext', 'server')).toContain(config.source.web + 'core/assets/file1.ext');
        });
    });   
    describe('when used on client to resolve namespaced packaged files path', () => {
        it('should resolve to correctly rooted path of given file', () => {
            expect(use('sys/core/assets/file1.ext', 'client')).toEqual('/' + config.source.sys + 'core/assets/file1.ext');
            expect(use('web/core/assets/file1.ext', 'client')).toEqual('/' + config.source.web + 'core/assets/file1.ext');
        });
    });

    describe('when used on server to resolve any arbitary folder files path', () => {
        it('should resolve to given path as is', () => {
            expect(use('gears/web/index.html', 'server')).toEqual('gears/web/index.html');
        });
    });  
    describe('when used on client to resolve any arbitary folder files path', () => {
        it('should resolve to given path as is', () => {
            expect(use('gears/web/index.html', 'client')).toEqual('gears/web/index.html');
        });
    });  

    describe('when used on server to resolve cataloged path', () => {
        it('should resolve to module member file path of the mapped module in catalog', () => {
            expect(use('[Base]', 'server')).toContain(config.source.sys + 'core/members/Base.js');
        });
    });   
    describe('when used on client to resolve cataloged path', () => {
        it('should resolve to module id of the mapped module in catalog', () => {
            expect(use('[Base]', 'client')).toEqual('sys.core.Base');
        });
    });

    describe('when used on server to resolve conditional path (a | b)', () => {
        it('should resolve to left side part', () => {
            expect(use('Server | Client', 'server')).toEqual('Server');
        });
        it('should resolve to dummy if left side part is empty', () => {
            expect(use(' | Client', 'server')).toEqual('dummy');
        });        
    });   
    describe('when used on client to resolve conditional path (a | b)', () => {
        it('should resolve to right side part', () => {
            expect(use('Server | Client', 'client')).toEqual('Client');
        });
        it('should resolve to dummy if right side part is empty', () => {
            expect(use('Server | ', 'client')).toEqual('dummy');
        });        
    }); 
});