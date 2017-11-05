'use strict'

import base64url from 'base64url'
import { cryptoClients } from './cryptoClients'
import decodeToken from './decode'

export class TokenVerifier {
    constructor(signingAlgorithm, rawPublicKey) {
        if (!(signingAlgorithm && rawPublicKey)) {
            throw new MissingParametersError(
                'a signing algorithm and public key are required')
        }
        if (typeof signingAlgorithm !== 'string') {
            throw 'signing algorithm parameter must be a string'
        }
        signingAlgorithm = signingAlgorithm.toUpperCase()
        if (!cryptoClients.hasOwnProperty(signingAlgorithm)) {
            throw 'invalid signing algorithm'
        }
        this.tokenType = 'JWT'
        this.cryptoClient = cryptoClients[signingAlgorithm]
        this.rawPublicKey = rawPublicKey
    }

    verify(token) {
        // decompose the token into parts
        const tokenParts = token.split('.')

        // calculate the signing input hash
        const signingInput = tokenParts[0] + '.' + tokenParts[1]
        const signingInputHash = this.cryptoClient.createHash(signingInput)

        // extract the signature as a DER array
        const derSignatureBuffer = this.cryptoClient.loadSignature(tokenParts[2])
     
        // verify the signed hash
        return this.cryptoClient.verifyHash(
            signingInputHash, derSignatureBuffer, this.rawPublicKey)
    }
}
