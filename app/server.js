const http = require('http');
const eetase = require('eetase');
const socketClusterServer = require('socketcluster-server');
const express = require('express');
const uuid = require('uuid');
const sccBrokerClient = require('scc-broker-client');
const fetch = require('node-fetch');
const sha256 = require('sha256');
require('dotenv').config()

const SOCKETCLUSTER_PORT = process.argv[2];
const SOCKETCLUSTER_LOG_LEVEL = process.env.SOCKETCLUSTER_LOG_LEVEL || 2;
const SCC_INSTANCE_ID = uuid.v4();
const SCC_STATE_SERVER_HOST = process.env.SCC_STATE_SERVER_HOST || null;
const SCC_STATE_SERVER_PORT = process.env.SCC_STATE_SERVER_PORT || null;
const SCC_MAPPING_ENGINE = process.env.SCC_MAPPING_ENGINE || null;
const SCC_CLIENT_POOL_SIZE = process.env.SCC_CLIENT_POOL_SIZE || null;
const SCC_AUTH_KEY = process.env.SCC_AUTH_KEY || null;
const SCC_INSTANCE_IP = process.env.SCC_INSTANCE_IP || null;
const SCC_INSTANCE_IP_FAMILY = process.env.SCC_INSTANCE_IP_FAMILY || null;
const SCC_STATE_SERVER_CONNECT_TIMEOUT = Number(process.env.SCC_STATE_SERVER_CONNECT_TIMEOUT) || null;
const SCC_STATE_SERVER_ACK_TIMEOUT = Number(process.env.SCC_STATE_SERVER_ACK_TIMEOUT) || null;
const SCC_STATE_SERVER_RECONNECT_RANDOMNESS = Number(process.env.SCC_STATE_SERVER_RECONNECT_RANDOMNESS) || null;
const SCC_PUB_SUB_BATCH_DURATION = Number(process.env.SCC_PUB_SUB_BATCH_DURATION) || null;
const SCC_BROKER_RETRY_DELAY = Number(process.env.SCC_BROKER_RETRY_DELAY) || null;

let agOptions = {
  pingTimeout: 1800000,
  pingInterval: 6000
};

if (process.env.SOCKETCLUSTER_OPTIONS) {
  let envOptions = JSON.parse(process.env.SOCKETCLUSTER_OPTIONS);
  Object.assign(agOptions, envOptions);
}

let httpServer = eetase(http.createServer());
let agServer = socketClusterServer.attach(httpServer, agOptions);

let expressApp = express();

// Add GET /health-check express route
expressApp.get('/health-check', (req, res) => {
  res.status(200).send('OK');
});

// HTTP request handling loop.
(async () => {
  for await (let requestData of httpServer.listener('request')) {
    expressApp.apply(null, requestData);
  }
})();

// SocketCluster/WebSocket connection handling loop.
(async () => {
  for await (let {
    socket
  } of agServer.listener('connection')) {
    console.log('new connection found.');
    (async () => {
      // Set up a loop to handle remote transmitted events.
      for await (let req of socket.procedure('login')) {
        try {
          let passwordHash = sha256(req.data.password);
          let result = await fetch('http://localhost:7777/login', {
            method: 'POST',
            body: JSON.stringify({
              userName: req.data.userName,
              password: passwordHash
            })
          });
          let res = await result.json();
          console.log('res:: ', res);

          if (res.success) {
            req.end({
              msg: 'successfully login.'
            })
            socket.setAuthToken({
              userName: res.data.userName,
              channels: res.data.channels
            });
          } else {
            let loginError = new Error(`Could not find the user`);
            loginError.name = 'LoginError';
            req.error(loginError);
            return;
          }
        } catch (err) {
          console.log('err: ', err);
          let loginError = new Error(`Something went wrong`);
          loginError.name = 'LoginError';
          req.error(loginError);
          return;
        }
      }
    })();
  }
})();

agServer.setMiddleware(agServer.MIDDLEWARE_INBOUND, async (middlewareStream) => {
  for await (let action of middlewareStream) {
    if (action.type === action.SUBSCRIBE) {
      let authToken = action.socket.authToken;
      console.log('authToken: ', authToken);
      if (!authToken || authToken.channels.indexOf(action.channel) === -1) {
        let subscribeError = new Error(`You are not authorized to subscribe to the ${action.channel} channel`);
        subscribeError.name = 'SubscribeError';
        action.block(subscribeError);
        // return subscribeError;
        continue; // Go to the start of the loop to process the next inbound action.
      }
    }
    // Any unhandled case will be allowed by default.
    action.allow();
  }
});

httpServer.listen(SOCKETCLUSTER_PORT);

if (SOCKETCLUSTER_LOG_LEVEL >= 1) {
  (async () => {
    for await (let {
      error
    } of agServer.listener('error')) {
      console.error(error);
    }
  })();
}

if (SOCKETCLUSTER_LOG_LEVEL >= 2) {
  console.log(
    `   ${colorText('[Active]', 32)} SocketCluster worker with PID ${process.pid} is listening on port ${SOCKETCLUSTER_PORT}`
  );

  (async () => {
    for await (let {
      warning
    } of agServer.listener('warning')) {
      console.warn(warning);
    }
  })();
}

function colorText(message, color) {
  if (color) {
    return `\x1b[${color}m${message}\x1b[0m`;
  }
  return message;
}

if (SCC_STATE_SERVER_HOST) {
  // Setup broker client to connect to SCC.
  let sccClient = sccBrokerClient.attach(agServer.brokerEngine, {
    instanceId: SCC_INSTANCE_ID,
    instancePort: SOCKETCLUSTER_PORT,
    instanceIp: SCC_INSTANCE_IP,
    instanceIpFamily: SCC_INSTANCE_IP_FAMILY,
    pubSubBatchDuration: SCC_PUB_SUB_BATCH_DURATION,
    stateServerHost: SCC_STATE_SERVER_HOST,
    stateServerPort: SCC_STATE_SERVER_PORT,
    mappingEngine: SCC_MAPPING_ENGINE,
    clientPoolSize: SCC_CLIENT_POOL_SIZE,
    authKey: SCC_AUTH_KEY,
    stateServerConnectTimeout: SCC_STATE_SERVER_CONNECT_TIMEOUT,
    stateServerAckTimeout: SCC_STATE_SERVER_ACK_TIMEOUT,
    stateServerReconnectRandomness: SCC_STATE_SERVER_RECONNECT_RANDOMNESS,
    brokerRetryDelay: SCC_BROKER_RETRY_DELAY
  });


  if (SOCKETCLUSTER_LOG_LEVEL >= 1) {
    (async () => {
      for await (let {
        error
      } of sccClient.listener('error')) {
        error.name = 'SCCError';
        console.error('error:: ', error);
      }
    })();
  }
}