const cds = require('@sap/cds');

cds.on('bootstrap', app => {
    // optional: add custom middleware here
});

cds.on('served', () => {
    console.log('📢 CAP service is up and running');
});

module.exports = cds.server;
