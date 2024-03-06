param name string
param location string
param sku string
param skucode string
param workerSize string
param workerSizeId string
param numberOfWorkers string

resource name_resource 'Microsoft.Web/serverfarms@2018-11-01' = {
  name: name
  location: location
  kind: 'linux'
  tags: {}
  properties: {
    name: name
    workerSize: workerSize
    workerSizeId: workerSizeId
    numberOfWorkers: numberOfWorkers
    reserved: true
    zoneRedundant: false
  }
  sku: {
    tier: sku
    name: skucode
  }
}
