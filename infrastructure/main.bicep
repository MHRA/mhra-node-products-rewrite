// common params

param appServicePlanName string

// asp only
param appSevicePlanLocation string
param sku string
param skucode string
param workerSize string
param workerSizeId string
param numberOfWorkers string

// 2 apps params
param subscriptionId string

// api only
param nodeApiName string
param nodeApiLocation string
param serverFarmResourceGroup string
param nodeApiAlwaysOn bool
param nodeApiftpsState string
param nodeApiLinuxFxVersion string

// updater only

param nodeDocIndexUpdaterName string
param nodeDocIndexUpdaterLocation string
param nodeDocIndexUpdaterftpsState string
param nodeDocIndexUpdaterAlwaysOn bool
param nodeDocIndexUpdaterLinuxFxVersion string


resource appServicePlan 'Microsoft.Web/serverfarms@2018-11-01' = {
  name: appServicePlanName
  location: appSevicePlanLocation
  kind: 'linux'
  tags: {}
  properties: {
    name: appServicePlanName
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


resource webApp 'Microsoft.Web/sites@2018-11-01' = {
  name: nodeApiName
  location: nodeApiLocation
  tags: {}
  properties: {
    name: nodeApiName
    siteConfig: {
      appSettings: []
      linuxFxVersion: nodeApiLinuxFxVersion
      alwaysOn: nodeApiAlwaysOn
      ftpsState: nodeApiftpsState
    }
    serverFarmId: '/subscriptions/${subscriptionId}/resourcegroups/${serverFarmResourceGroup}/providers/Microsoft.Web/serverfarms/${appServicePlanName}'
    clientAffinityEnabled: false
    virtualNetworkSubnetId: null
    httpsOnly: true
    publicNetworkAccess: 'Disabled'
  }
  dependsOn: []
}



resource name_resource 'Microsoft.Web/sites@2018-11-01' = {
  name: nodeDocIndexUpdaterName
  location: nodeDocIndexUpdaterLocation
  tags: {}
  properties: {
    name: nodeDocIndexUpdaterName
    siteConfig: {
      appSettings: []
      linuxFxVersion: nodeDocIndexUpdaterLinuxFxVersion
      alwaysOn: nodeDocIndexUpdaterAlwaysOn 
      ftpsState: nodeDocIndexUpdaterftpsState
    }
    serverFarmId: '/subscriptions/${subscriptionId}/resourcegroups/${serverFarmResourceGroup}/providers/Microsoft.Web/serverfarms/${appServicePlanName}'
    clientAffinityEnabled: false
    virtualNetworkSubnetId: null
    httpsOnly: true
    publicNetworkAccess: 'Disabled'
  }
  dependsOn: []
}
