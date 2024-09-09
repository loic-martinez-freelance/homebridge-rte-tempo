import type {
  API,
  Characteristic,
  DynamicPlatformPlugin,
  Logging,
  PlatformAccessory,
  PlatformConfig,
  Service,
} from 'homebridge'

import { RTETempoAccessory } from './platformAccessory.js'
import { PLATFORM_NAME, PLUGIN_NAME, PluginConfig } from './settings.js'

export class RTETempoPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service
  public readonly Characteristic: typeof Characteristic

  public readonly accessories: PlatformAccessory[] = []

  public pluginConfig: PluginConfig

  constructor(
    public readonly log: Logging,
    public readonly config: PlatformConfig,
    public readonly api: API
  ) {
    this.Service = api.hap.Service
    this.Characteristic = api.hap.Characteristic

    this.log.debug('Finished initializing platform:', this.config.name)

    this.pluginConfig = { refreshrate: this.config.refreshrate }

    this.api.on('didFinishLaunching', () => {
      this.discoverDevices()
    })
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName)
    this.accessories.push(accessory)
  }

  discoverDevices() {
    const uuid = this.api.hap.uuid.generate('RTETempo')
    const existingAccessory = this.accessories.find(
      (accessory) => accessory.UUID === uuid
    )

    if (existingAccessory) {
      new RTETempoAccessory(this, existingAccessory)
    } else {
      this.log.info('Adding new RTE Tempo accessory')
      const accessory = new this.api.platformAccessory('RTE Tempo', uuid)
      new RTETempoAccessory(this, accessory)
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        accessory,
      ])
    }
  }
}
