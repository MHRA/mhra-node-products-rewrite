@description('Common Parameters')
param FtpsState string
param ResouceLocation string
param IPRestrictions array

@description('App Service Plan Parameters')
param AppServicePlanName string
param AppServiceSKUTier string
param AppServiceSKUName string

@description('Medicines Api App Parameters')
param MedicinesApiName string
param MedicinesApiLinuxFxVersion string
param MedicinesApiAppSettings array

@description('Doc Index Updater Parameters')
param DocIndexUpdaterName string
param RedisName string
param DocIndexUpdaterLinuxFxVersion string
param DocIndexUpdaterAppSettings array

@description('Frontend Web Parameters')
param FrontendAppName string
param FrontendAppLinuxFxVersion string
param FrontendAppSettings array

@description('PARS Web Parameters')
param PARSAppName string
param PARSAppLinuxFxVersion string
param PARSAppSettings array

@description('PARS Parameters')

resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: AppServicePlanName
  location: ResouceLocation
  kind: 'linux'
  tags: {}
  sku: {
    tier: AppServiceSKUTier
    name: AppServiceSKUName
  }
  properties: {
    reserved: true
    zoneRedundant: false
  }
}

resource MedicinesApiApp 'Microsoft.Web/sites@2022-09-01' = {
  name: MedicinesApiName
  location: ResouceLocation
  tags: {
    application: 'Medicines API'
  }
  identity: {
    type:'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      acrUseManagedIdentityCreds: true
      linuxFxVersion: MedicinesApiLinuxFxVersion
      alwaysOn: true
      ftpsState: FtpsState
      minTlsVersion: '1.2'
      http20Enabled: true
      ipSecurityRestrictionsDefaultAction: 'Deny'
      scmIpSecurityRestrictionsUseMain: true
      scmIpSecurityRestrictionsDefaultAction: 'Deny'
      ipSecurityRestrictions: IPRestrictions
      // vnetName: 'aparz-spoke-np-products'
      // vnetRouteAllEnabled: true
      appSettings: MedicinesApiAppSettings
    }
    clientAffinityEnabled: false
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
    // virtualNetworkSubnetId: '/subscriptions/bec11470-1346-4cdd-af2e-ce1f360671a1/resourceGroups/adazr-rg-1001/providers/Microsoft.Network/virtualNetworks/aparz-spoke-np-products/subnets/adarz-spoke-products-sn-02'
  }
}

resource DocIndexUpdaterApp 'Microsoft.Web/sites@2022-09-01' = {
  name: DocIndexUpdaterName
  location: ResouceLocation
  tags: {
    application: 'Doc Index Updater'
  }
  identity: {
    type:'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: DocIndexUpdaterLinuxFxVersion
      alwaysOn: true
      ftpsState: FtpsState
      minTlsVersion: '1.2'
      http20Enabled: true
      ipSecurityRestrictionsDefaultAction: 'Deny'
      scmIpSecurityRestrictionsUseMain: true
      scmIpSecurityRestrictionsDefaultAction: 'Deny'
      ipSecurityRestrictions: IPRestrictions
      // vnetName: 'aparz-spoke-np-products'
      // vnetRouteAllEnabled: true
      appSettings: DocIndexUpdaterAppSettings
    }
    clientAffinityEnabled: false
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
    
    // virtualNetworkSubnetId: '/subscriptions/bec11470-1346-4cdd-af2e-ce1f360671a1/resourceGroups/adazr-rg-1001/providers/Microsoft.Network/virtualNetworks/aparz-spoke-np-products/subnets/adarz-spoke-products-sn-02'
  }
}

resource PARSApp 'Microsoft.Web/sites@2022-09-01' = {
  name: PARSAppName
  location: ResouceLocation
  tags: {
    application: 'PARS'
  }
  identity: {
    type:'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: PARSAppLinuxFxVersion
      alwaysOn: true
      ftpsState: FtpsState
      minTlsVersion: '1.2'
      http20Enabled: true
      ipSecurityRestrictionsDefaultAction: 'Deny'
      scmIpSecurityRestrictionsUseMain: true
      scmIpSecurityRestrictionsDefaultAction: 'Deny'
      ipSecurityRestrictions: IPRestrictions
      // vnetName: 'aparz-spoke-np-products'
      // vnetRouteAllEnabled: true
      appSettings: PARSAppSettings
    }
    clientAffinityEnabled: false
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
    
    // virtualNetworkSubnetId: '/subscriptions/bec11470-1346-4cdd-af2e-ce1f360671a1/resourceGroups/adazr-rg-1001/providers/Microsoft.Network/virtualNetworks/aparz-spoke-np-products/subnets/adarz-spoke-products-sn-02'
  }
}

resource FrontendApp 'Microsoft.Web/sites@2022-09-01' = {
  name: FrontendAppName
  location: ResouceLocation
  tags: {
    application: 'Web Frontend'
  }
  identity: {
    type:'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: FrontendAppLinuxFxVersion
      alwaysOn: true
      ftpsState: FtpsState
      minTlsVersion: '1.2'
      http20Enabled: true
      ipSecurityRestrictionsDefaultAction: 'Deny'
      scmIpSecurityRestrictionsUseMain: true
      scmIpSecurityRestrictionsDefaultAction: 'Deny'
      ipSecurityRestrictions: IPRestrictions
      // vnetName: 'aparz-spoke-np-products'
      // vnetRouteAllEnabled: true
      appSettings: FrontendAppSettings
    }
    clientAffinityEnabled: false
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
    
    // virtualNetworkSubnetId: '/subscriptions/bec11470-1346-4cdd-af2e-ce1f360671a1/resourceGroups/adazr-rg-1001/providers/Microsoft.Network/virtualNetworks/aparz-spoke-np-products/subnets/adarz-spoke-products-sn-02'
  }
}

resource DocIndexUpdaterRedis 'Microsoft.Cache/redis@2023-08-01' = {
  name: RedisName
  location: ResouceLocation
  tags: {
    application: 'Doc Index Updater'
  }
  identity: {
    type:'SystemAssigned'
  }
  properties: {
    enableNonSslPort: true
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
    redisConfiguration: {
      // 'aad-enabled': 'string'
      // 'aof-backup-enabled': 'string'
      // 'aof-storage-connection-string-0': 'string'
      // 'aof-storage-connection-string-1': 'string'
      // authnotrequired: 'string'
      'maxfragmentationmemory-reserved': '2'
      'maxmemory-delta': '2'
      'maxmemory-policy': 'volatile-lru'
      'maxmemory-reserved': '2'
      // 'preferred-data-persistence-auth-method': 'string'
      // 'rdb-backup-enabled': 'string'
      // 'rdb-backup-frequency': 'string'
      // 'rdb-backup-max-snapshot-count': 'string'
      // 'rdb-storage-connection-string': 'string'
      // 'storage-subscription-id': 'string'
    }
    redisVersion: 'latest'
    // replicasPerMaster: 0
    // replicasPerPrimary: 0
    // shardCount: int
    sku: {
      capacity: 0
      family: 'C'
      name: 'Basic'
    }
    // staticIP: 'string'
    // subnetId: 'string'
    // tenantSettings: {
    //   {customized property}: 'string'
    // }
  }
}
