/* Copyright 2014 Open Ag Data Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Express server to test the server client part of the library
 */
'use strict';

var login = require('oada-id-client').middleware;
var fs = require('fs');
var path = require('path');
var express = require('express');
var compression = require('compression');
var objectAssign = require('object-assign');
var oadaError = require('oada-error').middleware;
var app = express();
var pem2jwk = require('pem-jwk').pem2jwk;

var pem = fs.readFileSync(__dirname + '/privkey.pem');
var kid = 'nc63dhaSdd82w32udx6v';
var key = {pem:pem, kid:kid};

var options = {
    metadata: 'eyJqa3UiOiJodHRwczovL2lkZW50aXR5Lm9hZGEtZGV2LmNvbS9jZXJ0cyIsImtpZCI6ImtqY1NjamMzMmR3SlhYTEpEczNyMTI0c2ExIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJyZWRpcmVjdF91cmlzIjpbImh0dHBzOi8vY2xpZW50Lm9hZGEtZGV2LmNvbS9yZWRpcmVjdCIsImh0dHBzOi8vY2xpZW50Lm9hZGEtZGV2LmNvbS9yZWRpcmVjdC5odG1sIl0sInRva2VuX2VuZHBvaW50X2F1dGhfbWV0aG9kIjoidXJuOmlldGY6cGFyYW1zOm9hdXRoOmNsaWVudC1hc3NlcnRpb24tdHlwZTpqd3QtYmVhcmVyIiwiZ3JhbnRfdHlwZXMiOlsiaW1wbGljaXQiLCJhdXRob3JpemF0aW9uX2NvZGUiXSwicmVzcG9uc2VfdHlwZXMiOlsidG9rZW4iLCJjb2RlIiwiaWRfdG9rZW4iLCJpZF90b2tlbiB0b2tlbiIsImNvZGUgaWRfdG9rZW4iLCJjb2RlIHRva2VuIiwiY29kZSBpZF90b2tlbiB0b2tlbiJdLCJjbGllbnRfbmFtZSI6Ik9BREEgUmVmZXJlbmNlIEltcGxlbWVudGF0aW9uIiwiY2xpZW50X3VyaSI6Imh0dHBzOi8vY2xpZW50Lm9hZGEtZGV2LmNvbSIsImNvbnRhY3RzIjpbIkluZm8gPGluZm9Ab3BlbmFnLmlvPiJdLCJwb2xpY3lfdXJpIjoiaHR0cHM6Ly9jbGllbnQub2FkYS1kZXYuY29tL3B1Yy5odG1sIiwidG9zX3VyaSI6Imh0dHBzOi8vY2xpZW50Lm9hZGEtZGV2LmNvbS9wdWMuaHRtbCIsImxpY2Vuc2VzIjpbeyJpZCI6Im9hZGEtMS4wIiwibmFtZSI6Ik9BREEgRXhhbXBsZSB2MS4wIn0seyJpZCI6Im9hZGEtMi4wIiwibmFtZSI6Ik9BREEgRXhhbXBsZSB2Mi4wIn1dLCJqd2tzX3VyaSI6Imh0dHBzOi8vY2xpZW50Lm9hZGEtZGV2LmNvbS9jZXJ0cyIsInNvZnR3YXJlX2lkIjoiMGMyNGYxNGYtODE3Yy00ZDY0LTljYWEtMGExMTBlOGVjNDYzIiwicmVnaXN0cmF0aW9uX3Byb2l2ZGVyIjoiaHR0cHM6Ly9pZGVudGl0eS5vYWRhLWRldi5jb20iLCJpYXQiOjE0MzExMTU0Mjl9.D1wI4XEpL6UkozsISUMZzS40ckHY7oV1m1OT7m3Roxk-vvVtuNFjxsKAfoBmq8pSZAJgqfZe8d6H9_0Twz9YM-X7fLJMLSiPAPPhqyuHZtbX2B_mTgkf18m_ZYz5Bqhb_uAwhXat1avB0zmF84Bc1zFKWVMUxC7GHmg3Wk50LV0',
    redirect: 'https://client.oada-dev.com/redirect',
    scope: 'bookmarks.machines.harvesters bookmarks.clients bookmarks.fields resources',
    prompt: 'consent',
    privateKey: key,
};

app.use(compression());

app.use('/who_identity',
    login.getIDToken('identity.oada-dev.com', options));

app.use('/get_identity',
    login.getAccessToken('identity.oada-dev.com', options));

app.use('/get_provider',
    login.getAccessToken('provider.oada-dev.com', options));

app.use('/redirect', login.handleRedirect());
app.use('/redirect', function(req, res) {
    res.json(req.token);
});

app.get('/certs', function(req, res) {
    var jwk = pem2jwk(key.pem);

    res.json({
        keys: [{
            kty: "RSA",
            alg: "RS256",
            use: "sig",
            kid: key.kid,
            n: jwk.n,
            e: jwk.e

        }]
    });
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(oadaError());

app.listen(3002);
