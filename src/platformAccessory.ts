import { type PlatformAccessory, type Service } from 'homebridge'
import type { RteTempoPlatform } from './platform.js'

const HOURLY_RATE = 3600000
const TENMIN_RATE = 600000

export class RTETempoAccessory {
  private blueDayService: Service
  private whiteDayService: Service
  private redDayService: Service

  constructor(
    private readonly platform: RteTempoPlatform,
    private readonly accessory: PlatformAccessory
  ) {
    this.accessory
      .getService(this.platform.api.hap.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.api.hap.Characteristic.Manufacturer,
        'Homebridge RTE Tempo'
      )
      .setCharacteristic(
        this.platform.api.hap.Characteristic.Model,
        'Homebridge RTE Tempo'
      )

    this.blueDayService =
      this.accessory.getService('Tempo jour bleu') ||
      this.accessory.addService(
        this.platform.api.hap.Service.MotionSensor,
        'Tempo jour bleu',
        'tempojourbleu'
      )
    this.blueDayService.addOptionalCharacteristic(
      this.platform.api.hap.Characteristic.ConfiguredName
    )
    this.blueDayService.setCharacteristic(
      this.platform.api.hap.Characteristic.ConfiguredName,
      'Tempo jour bleu'
    )

    this.whiteDayService =
      this.accessory.getService('Tempo jour blanc') ||
      this.accessory.addService(
        this.platform.api.hap.Service.MotionSensor,
        'Tempo jour blanc',
        'tempojourblanc'
      )
    this.whiteDayService.addOptionalCharacteristic(
      this.platform.api.hap.Characteristic.ConfiguredName
    )
    this.whiteDayService.setCharacteristic(
      this.platform.api.hap.Characteristic.ConfiguredName,
      'Tempo jour blanc'
    )

    this.redDayService =
      this.accessory.getService('Tempo jour rouge') ||
      this.accessory.addService(
        this.platform.api.hap.Service.MotionSensor,
        'Tempo jour rouge',
        'tempojourrouge'
      )
    this.redDayService.addOptionalCharacteristic(
      this.platform.api.hap.Characteristic.ConfiguredName
    )
    this.redDayService.setCharacteristic(
      this.platform.api.hap.Characteristic.ConfiguredName,
      'Tempo jour rouge'
    )

    this.startAccessory()
  }

  private startAccessory = () => {
    this.update()
    setInterval(() => {
      this.platform.log.debug(
        'Selected refresh rate : ',
        this.platform.pluginConfig.refreshrate
      )
      if (this.platform.pluginConfig.refreshrate === 'hourly') {
        this.update()
      } else {
        const currentDate = new Date()
        const hours = currentDate.getHours()
        this.platform.log.debug('Current time : ', hours)
        if (hours === 1) {
          this.update()
        }
      }
    }, HOURLY_RATE)
  }

  private update = async () => {
    const color = await this.getRTEColor()
    this.platform.log.info('Updating tempo color :', color)
    this.blueDayService.updateCharacteristic(
      this.platform.api.hap.Characteristic.MotionDetected,
      color === 1 ? true : false
    )
    this.whiteDayService.updateCharacteristic(
      this.platform.api.hap.Characteristic.MotionDetected,
      color === 2 ? true : false
    )
    this.redDayService.updateCharacteristic(
      this.platform.api.hap.Characteristic.MotionDetected,
      color === 3 ? true : false
    )

    if (color === 0) {
      this.platform.log.info('Update will retry in 10 minutes')
      setTimeout(() => {
        this.update()
      }, TENMIN_RATE)
    }
  }

  private getRTEColor = async () => {
    try {
      const response = await fetch(
        'https://www.api-couleur-tempo.fr/api/jourTempo/today'
      )
      const parsed = await response.json()
      return parsed.codeJour as number
    } catch (e) {
      this.platform.log.error('Cannot reach Tempo API', e)
      return 0
    }
  }
}
