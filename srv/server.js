const cds = require('@sap/cds')

cds.on('bootstrap', app => {
  console.log('🔧 Bootstrap triggered')
})

cds.on('served', services => {
  console.log('✅ Services served:', Object.keys(services).join(', '))
})

module.exports = cds.server
