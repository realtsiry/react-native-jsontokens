'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.runMainTests = runMainTests;

var _tape = require('tape');

var _tape2 = _interopRequireDefault(_tape);

var _base64url = require('base64url');

var _base64url2 = _interopRequireDefault(_base64url);

var _index = require('../index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function runMainTests() {
    var rawPrivateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f';
    var rawPublicKey = '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479';
    var sampleToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3N1ZWRBdCI6IjE0NDA3MTM0MTQuODUiLCJjaGFsbGVuZ2UiOiI3Y2Q5ZWQ1ZS1iYjBlLTQ5ZWEtYTMyMy1mMjhiZGUzYTA1NDkiLCJpc3N1ZXIiOnsicHVibGljS2V5IjoiMDNmZGQ1N2FkZWMzZDQzOGVhMjM3ZmU0NmIzM2VlMWUwMTZlZGE2YjU4NWMzZTI3ZWE2NjY4NmMyZWE1MzU4NDc5IiwiY2hhaW5QYXRoIjoiYmQ2Mjg4NWVjM2YwZTM4MzgwNDMxMTVmNGNlMjVlZWRkMjJjYzg2NzExODAzZmIwYzE5NjAxZWVlZjE4NWUzOSIsInB1YmxpY0tleWNoYWluIjoieHB1YjY2MU15TXdBcVJiY0ZRVnJRcjRRNGtQamFQNEpqV2FmMzlmQlZLalBkSzZvR0JheUU0NkdBbUt6bzVVRFBRZExTTTlEdWZaaVA4ZWF1eTU2WE51SGljQnlTdlpwN0o1d3N5UVZwaTJheHpaIiwiYmxvY2tjaGFpbmlkIjoicnlhbiJ9fQ.DUf6Rnw6FBKv4Q3y95RX7rR6HG_L1Va96ThcIYTycOf1j_bf9WleLsOyiZ-35Qfw7FgDnW7Utvz4sNjdWOSnhQ';
    var sampleDecodedToken = {
        header: { typ: 'JWT', alg: 'ES256K' },
        payload: { issuedAt: '1440713414.85',
            challenge: '7cd9ed5e-bb0e-49ea-a323-f28bde3a0549',
            issuer: { publicKey: '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479',
                chainPath: 'bd62885ec3f0e3838043115f4ce25eedd22cc86711803fb0c19601eeef185e39',
                publicKeychain: 'xpub661MyMwAqRbcFQVrQr4Q4kPjaP4JjWaf39fBVKjPdK6oGBayE46GAmKzo5UDPQdLSM9DufZiP8eauy56XNuHicBySvZp7J5wsyQVpi2axzZ',
                blockchainid: 'ryan' } },
        signature: 'oO7ROPKq3T3X0azAXzHsf6ub6CYy5nUUFDoy8MS22B3TlYisqsBrRtzWIQcSYiFXLytrXwAdt6vjehj3OFioDQ'
    };

    (0, _tape2.default)('TokenSigner', function (t) {
        t.plan(6);

        var tokenSigner = new _index.TokenSigner('ES256K', rawPrivateKey);
        t.ok(tokenSigner, 'token signer should have been created');

        var token = tokenSigner.sign(sampleDecodedToken.payload);
        t.ok(token, 'token should have been created');
        t.equal(typeof token === 'undefined' ? 'undefined' : _typeof(token), 'string', 'token should be a string');
        t.equal(token.split('.').length, 3, 'token should have 3 parts');
        //console.log(token)

        var decodedToken = (0, _index.decodeToken)(token);
        t.equal(JSON.stringify(decodedToken.header), JSON.stringify(sampleDecodedToken.header), 'decodedToken header should match the reference header');
        t.equal(JSON.stringify(decodedToken.payload), JSON.stringify(sampleDecodedToken.payload), 'decodedToken payload should match the reference payload');
    });

    (0, _tape2.default)('createUnsecuredToken', function (t) {
        t.plan(3);

        var unsecuredToken = (0, _index.createUnsecuredToken)(sampleDecodedToken.payload);
        t.ok(unsecuredToken, 'unsecured token should have been created');
        t.equal(unsecuredToken, _base64url2.default.encode(JSON.stringify({ typ: 'JWT', alg: 'none' })) + '.' + sampleToken.split('.')[1] + '.', 'unsigned token should equal reference');

        var decodedToken = (0, _index.decodeToken)(unsecuredToken);
        t.ok(decodedToken, 'token should have been decoded');
    });

    (0, _tape2.default)('TokenVerifier', function (t) {
        t.plan(3);

        var tokenVerifier = new _index.TokenVerifier('ES256K', rawPublicKey);
        t.ok(tokenVerifier, 'token verifier should have been created');

        var verified = tokenVerifier.verify(sampleToken);
        t.equal(verified, true, 'token should have been verified');

        var tokenSigner = new _index.TokenSigner('ES256K', rawPrivateKey);
        var newToken = tokenSigner.sign(sampleDecodedToken.payload);
        var newTokenVerified = tokenVerifier.verify(newToken);
        t.equal(verified, true, 'token should have been verified');
    });

    (0, _tape2.default)('decodeToken', function (t) {
        t.plan(2);

        var decodedToken = (0, _index.decodeToken)(sampleToken);
        t.ok(decodedToken, 'token should have been decoded');
        t.equal(JSON.stringify(decodedToken.payload), JSON.stringify(sampleDecodedToken.payload), 'decodedToken payload should match the reference payload');
    });
}