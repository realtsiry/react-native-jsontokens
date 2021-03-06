'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TokenSigner = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createUnsecuredToken = createUnsecuredToken;

var _base64url = require('base64url');

var _base64url2 = _interopRequireDefault(_base64url);

var _cryptoClients = require('./cryptoClients');

var _decode = require('./decode');

var _decode2 = _interopRequireDefault(_decode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function createSigningInput(payload, header) {
    var tokenParts = [];

    // add in the header
    var encodedHeader = _base64url2.default.encode(JSON.stringify(header));
    tokenParts.push(encodedHeader);

    // add in the payload
    var encodedPayload = _base64url2.default.encode(JSON.stringify(payload));
    tokenParts.push(encodedPayload);

    // prepare the message
    var signingInput = tokenParts.join('.');

    // return the signing input
    return signingInput;
}

function createUnsecuredToken(payload) {
    var header = { typ: 'JWT', alg: 'none' };
    return createSigningInput(payload, header) + '.';
}

var TokenSigner = exports.TokenSigner = function () {
    function TokenSigner(signingAlgorithm, rawPrivateKey) {
        _classCallCheck(this, TokenSigner);

        if (!(signingAlgorithm && rawPrivateKey)) {
            throw new MissingParametersError('a signing algorithm and private key are required');
        }
        if (typeof signingAlgorithm !== 'string') {
            throw 'signing algorithm parameter must be a string';
        }
        signingAlgorithm = signingAlgorithm.toUpperCase();
        if (!_cryptoClients.cryptoClients.hasOwnProperty(signingAlgorithm)) {
            throw 'invalid signing algorithm';
        }
        this.tokenType = 'JWT';
        this.cryptoClient = _cryptoClients.cryptoClients[signingAlgorithm];
        this.rawPrivateKey = rawPrivateKey;
    }

    _createClass(TokenSigner, [{
        key: 'header',
        value: function header() {
            return { typ: this.tokenType, alg: this.cryptoClient.algorithmName };
        }
    }, {
        key: 'sign',
        value: function sign(payload) {
            // prepare the message to be signed
            var signingInput = createSigningInput(payload, this.header());
            var signingInputHash = this.cryptoClient.createHash(signingInput);

            // sign the message and add in the signature
            var signature = this.cryptoClient.signHash(signingInputHash, this.rawPrivateKey);

            // return the token
            return [signingInput, signature].join('.');
        }
    }]);

    return TokenSigner;
}();