// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.

import Log from '../../src/Log';
import MetadataService from '../../src/MetadataService';

import StubJsonService from './StubJsonService';

import chai from 'chai';
chai.should();
let assert = chai.assert;

describe("MetadataService", function() {
    let subject;
    let settings;
    let stubJsonService;

    beforeEach(function() {
        Log.logger = console;
        Log.level = Log.NONE;
        
        settings = {};
        stubJsonService = new StubJsonService();
        subject = new MetadataService(settings, ()=>stubJsonService);
    });

    describe("constructor", function() {

        it("should require a settings param", function() {
            try {
                new MetadataService();
            }
            catch (e) {
                e.message.should.contain('settings');
                return;
            }
            assert.fail();
        });

    });

    describe("getMetadata", function() {

        it("should return a promise", function() {
            subject.getMetadata().should.be.instanceof(Promise);
        });

        it("should use metadata on settings", function(done) {
            settings.metadata = "test";

            let p = subject.getMetadata();

            p.then(result => {
                result.should.equal("test");
                done();
            });
        });

        it("should require metadataUrl", function(done) {
            delete settings.metadataUrl;

            let p = subject.getMetadata();

            p.then(null, err => {
                err.message.should.contain('metadataUrl');
                done();
            });
        });

        it("should require metadataUrl", function(done) {
            delete settings.metadataUrl;

            let p = subject.getMetadata();

            p.then(null, err => {
                err.message.should.contain('metadataUrl');
                done();
            });
        });

        it("should use metadataUrl to make json call", function() {
            settings.metadataUrl = "http://sts/metadata";
            stubJsonService.result = Promise.resolve('test');

            subject.getMetadata();

            stubJsonService.url.should.equal("http://sts/metadata");
        });

        it("should return metadata from json call", function(done) {
            settings.metadataUrl = "http://sts/metadata";
            stubJsonService.result = Promise.resolve("test");

            let p = subject.getMetadata();

            p.then(result => {
                result.should.equal("test");
                done();
            });
        });

        it("should cache metadata from json call", function(done) {
            settings.metadataUrl = "http://sts/metadata";
            stubJsonService.result = Promise.resolve("test");

            let p = subject.getMetadata();

            p.then(result => {
                settings.metadata.should.equal("test");
                done();
            });
        });

        it("should fail if json call fails", function(done) {
            settings.metadataUrl = "http://sts/metadata";
            stubJsonService.result = Promise.reject(new Error("test"));

            let p = subject.getMetadata();

            p.then(null, err => {
                err.message.should.contain("test");
                done();
            });
        });

    });
    
     describe("_getMetadataProperty", function() {

        it("should return a promise", function() {
            subject._getMetadataProperty().should.be.instanceof(Promise);
        });

        it("should use metadata on settings", function(done) {
            settings.metadata = {
                foo: "test"
            };

            let p = subject._getMetadataProperty("foo");

            p.then(result => {
                result.should.equal("test");
                done();
            });
        });

        it("should fail if no data on metadata", function(done) {
            settings.metadata = {
            };

            let p = subject._getMetadataProperty("foo");

            p.then(null, err => {
                err.message.should.contain("foo");
                done();
            });
        });
        
         it("should fail if json call to load metadata fails", function(done) {
             
            settings.metadataUrl = "http://sts/metadata";
            stubJsonService.result = Promise.reject(new Error("test"));

            let p = subject._getMetadataProperty("foo");

            p.then(null, err => {
                err.message.should.contain("test");
                done();
            });
        });
        
    });

    describe("getAuthorizationEndpoint", function() {

        it("should return value from metadata", function(done) {
            settings.metadata = {
                authorization_endpoint: "http://sts/authorize"
            };

            let p = subject.getAuthorizationEndpoint();

            p.then(result => {
                result.should.equal("http://sts/authorize");
                done();
            });
        });
        
    });

    describe("getUserInfoEndpoint", function() {

        it("should return value from", function(done) {
            settings.metadata = {
                userinfo_endpoint: "http://sts/userinfo"
            };

            let p = subject.getUserInfoEndpoint();

            p.then(result => {
                result.should.equal("http://sts/userinfo");
                done();
            });
        });

    });

    describe("getEndSessionEndpoint", function() {

        it("should return value from", function(done) {
            settings.metadata = {
                end_session_endpoint: "http://sts/signout"
            };

            let p = subject.getEndSessionEndpoint();

            p.then(result => {
                result.should.equal("http://sts/signout");
                done();
            });
        });

    });
    
    describe("getCheckSessionIframe", function() {

        it("should return value from", function(done) {
            settings.metadata = {
                check_session_iframe: "http://sts/check_session"
            };

            let p = subject.getCheckSessionIframe();

            p.then(result => {
                result.should.equal("http://sts/check_session");
                done();
            });
        });

    });
    
    describe("getIssuer", function() {

        it("should return value from", function(done) {
            settings.metadata = {
                issuer: "http://sts"
            };

            let p = subject.getIssuer();

            p.then(result => {
                result.should.equal("http://sts");
                done();
            });
        });

    });
    
    describe("getSigningKeys", function() {

        it("should return a promise", function() {
            subject.getSigningKeys().should.be.instanceof(Promise);
        });

        it("should use signingKeys on settings", function(done) {
            settings.signingKeys = "test";

            let p = subject.getSigningKeys();

            p.then(result => {
                result.should.equal("test");
                done();
            });
        });

        it("should fail if metadata does not have jwks_uri", function(done) {
            settings.metadata = "test";

            let p = subject.getSigningKeys();

            p.then(null, err => {
                err.message.should.contain('jwks_uri');
                done();
            });
        });

        it("should fail if keys missing on keyset from jwks_uri", function(done) {
            settings.metadata = {
                jwks_uri: "http://sts/metadata/keys"
            };
            stubJsonService.result = Promise.resolve({});

            let p = subject.getSigningKeys();

            p.then(null, err => {
                err.message.should.contain("keyset");
                done();
            })
        });

        it("should make json call to jwks_uri", function(done) {
            settings.metadata = {
                jwks_uri: "http://sts/metadata/keys"
            };
            stubJsonService.result = Promise.resolve({keys:[{
                use:'sig',
                kid:"test"
            }]});

            let p = subject.getSigningKeys();

            p.then(result => {
                stubJsonService.url.should.equal("http://sts/metadata/keys");
                done();
            });
        });

        it("should return keys from jwks_uri", function(done) {
            
            settings.metadata = {
                jwks_uri: "http://sts/metadata/keys"
            };
            stubJsonService.result = Promise.resolve({keys:[{
                use:'sig',
                kid:"test"
            }]});

            let p = subject.getSigningKeys();

            p.then(keys => {
                keys.should.deep.equal([{
                    use:'sig',
                    kid:"test"
                }]);
                done();
            });
        });

        it("should cache keys in settings", function(done) {
            settings.metadata = {
                jwks_uri: "http://sts/metadata/keys"
            };
            stubJsonService.result = Promise.resolve({keys:[{
                use:'sig',
                kid:"test"
            }]});

            let p = subject.getSigningKeys();

            p.then(keys => {
                settings.signingKeys.should.deep.equal([{
                    use:'sig',
                    kid:"test"
                }]);
                done();
            })
        });
        
        it("should filter signing keys", function(done) {
            settings.metadata = {
                jwks_uri: "http://sts/metadata/keys"
            };
            stubJsonService.result = Promise.resolve({
                keys:[
                {
                    use:'sig',
                    kid:"test"
                },
                {
                    use:'enc',
                    kid:"test"
                }]
            });

            let p = subject.getSigningKeys();

            p.then(keys => {
                keys.should.deep.equal([{
                    use:'sig',
                    kid:"test"
                }]);
                done();
            })
        });

    });
});
