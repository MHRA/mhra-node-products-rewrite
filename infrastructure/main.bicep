// common params

param appServicePlanName string

// asp only
param appSevicePlanLocation string
param sku string
param skucode string
param workerSizeId string
param numberOfWorkers string
param workerTierName string

// 2 apps params

// api only
param nodeApiName string
param nodeApiLocation string
param nodeApiAlwaysOn bool
param nodeApiFtpsState string
param nodeApiLinuxFxVersion string

// updater only

param nodeDocIndexUpdaterName string
param nodeDocIndexUpdaterLocation string
param nodeDocIndexUpdaterftpsState string
param nodeDocIndexUpdaterAlwaysOn bool
param nodeDocIndexUpdaterLinuxFxVersion string



resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: appSevicePlanLocation
  kind: 'linux'
  tags: {}
  sku: {
    tier: sku
    name: skucode
  }
  properties: {
    reserved: true
    zoneRedundant: false
    workerTierName: workerTierName
    targetWorkerSizeId: workerSizeId
    targetWorkerCount: numberOfWorkers
  }
}

resource nodeApiApp 'Microsoft.Web/sites@2022-09-01' = {
  name: nodeApiName
  location: nodeApiLocation
  tags: {
    application: 'Node Api'
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      appSettings: []
      linuxFxVersion: nodeApiLinuxFxVersion
      alwaysOn: nodeApiAlwaysOn
      ftpsState: nodeApiFtpsState
    }
    clientAffinityEnabled: false
    virtualNetworkSubnetId: null
    httpsOnly: true
    publicNetworkAccess: 'Disabled'
  }
  dependsOn: [
    appServicePlan
  ]
}



resource nodeDocIndexUpdaterApp 'Microsoft.Web/sites@2022-09-01' = {
  name: nodeDocIndexUpdaterName
  location: nodeDocIndexUpdaterLocation
  tags: {
    applicaiton: 'node doc index updater'
  }
  properties: {
    name: nodeDocIndexUpdaterName
    siteConfig: {
      appSettings: []
      linuxFxVersion: nodeDocIndexUpdaterLinuxFxVersion
      alwaysOn: nodeDocIndexUpdaterAlwaysOn 
      ftpsState: nodeDocIndexUpdaterftpsState
    }
    serverFarmId:  appServicePlan.id
    clientAffinityEnabled: false
    virtualNetworkSubnetId: null
    httpsOnly: true
    publicNetworkAccess: 'Disabled'
  }
  dependsOn: [
    appServicePlan
  ]
}
