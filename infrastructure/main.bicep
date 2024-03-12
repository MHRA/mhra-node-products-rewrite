@description('Common Parameters')
param appServicePlanName string

@description('App Service Plan Parameters')
param appSevicePlanLocation string
param sku string
param skuCode string
param workerTierName string

@description('Node Api App Parameters')
param nodeApiName string
param nodeApiLocation string
param nodeApiAlwaysOn bool
param nodeApiFtpsState string
param nodeApiLinuxFxVersion string

@description('Node Doc Index Updater Parameters')
param nodeDocIndexUpdaterName string
param nodeDocIndexUpdaterLocation string
param nodeDocIndexUpdaterFtpsState string
param nodeDocIndexUpdaterAlwaysOn bool
param nodeDocIndexUpdaterLinuxFxVersion string



resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: appSevicePlanLocation 
  kind: 'linux'
  tags: {}
  sku: {
    tier: sku
    name: skuCode
  }
  properties: {
    reserved: true
    zoneRedundant: false
    workerTierName: workerTierName
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
      linuxFxVersion: nodeApiLinuxFxVersion
      alwaysOn: nodeApiAlwaysOn
      ftpsState: nodeApiFtpsState
      minTlsVersion: '1.2'
      http20Enabled: true
    }
    clientAffinityEnabled: false
    httpsOnly: true
    publicNetworkAccess: 'Disabled'
  }
}



resource nodeDocIndexUpdaterApp 'Microsoft.Web/sites@2022-09-01' = {
  name: nodeDocIndexUpdaterName
  location: nodeDocIndexUpdaterLocation
  tags: {
    application: 'node doc index updater'
  }
  properties: {
    serverFarmId:  appServicePlan.id
    siteConfig: {
      linuxFxVersion: nodeDocIndexUpdaterLinuxFxVersion
      alwaysOn: nodeDocIndexUpdaterAlwaysOn 
      ftpsState: nodeDocIndexUpdaterFtpsState
      minTlsVersion: '1.2'
      http20Enabled: true
    }
    clientAffinityEnabled: false
    httpsOnly: true
    publicNetworkAccess: 'Disabled'
  }
}
