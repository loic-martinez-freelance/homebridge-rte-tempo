import { type PlatformAccessory, type Service } from 'homebridge'
import type { RTETempoPlatform } from './platform.js'

const HOURLY_RATE = 3600000

export class RTETempoAccessory {
  private blueDayService: Service
  private whiteDayService: Service
  private redDayService: Service

  constructor(
    private readonly platform: RTETempoPlatform,
    private readonly accessory: PlatformAccessory
  ) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        'Homebridge RTE Tempo'
      )
      .setCharacteristic(
        this.platform.Characteristic.Model,
        'Homebridge RTE Tempo'
      )

    this.blueDayService =
      this.accessory.getService('Tempo jour bleu') ||
      this.accessory.addService(
        this.platform.Service.MotionSensor,
        'Tempo jour bleu',
        'tempojourbleu'
      )
    this.blueDayService.addOptionalCharacteristic(
      this.platform.Characteristic.ConfiguredName
    )
    this.blueDayService.setCharacteristic(
      this.platform.Characteristic.ConfiguredName,
      'Tempo jour bleu'
    )

    this.whiteDayService =
      this.accessory.getService('Tempo jour blanc') ||
      this.accessory.addService(
        this.platform.Service.MotionSensor,
        'Tempo jour blanc',
        'tempojourblanc'
      )
    this.whiteDayService.addOptionalCharacteristic(
      this.platform.Characteristic.ConfiguredName
    )
    this.whiteDayService.setCharacteristic(
      this.platform.Characteristic.ConfiguredName,
      'Tempo jour blanc'
    )

    this.redDayService =
      this.accessory.getService('Tempo jour rouge') ||
      this.accessory.addService(
        this.platform.Service.MotionSensor,
        'Tempo jour rouge',
        'tempojourrouge'
      )
    this.redDayService.addOptionalCharacteristic(
      this.platform.Characteristic.ConfiguredName
    )
    this.redDayService.setCharacteristic(
      this.platform.Characteristic.ConfiguredName,
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
    this.platform.log.debug('Updating tempo color :', color)
    switch (color) {
      case 0:
        this.blueDayService.updateCharacteristic(
          this.platform.Characteristic.MotionDetected,
          false
        )
        this.whiteDayService.updateCharacteristic(
          this.platform.Characteristic.MotionDetected,
          false
        )
        this.redDayService.updateCharacteristic(
          this.platform.Characteristic.MotionDetected,
          false
        )
        break
      case 1:
        this.blueDayService.updateCharacteristic(
          this.platform.Characteristic.MotionDetected,
          true
        )
        this.whiteDayService.updateCharacteristic(
          this.platform.Characteristic.MotionDetected,
          false
        )
        this.redDayService.updateCharacteristic(
          this.platform.Characteristic.MotionDetected,
          false
        )
        break
      case 2:
        this.blueDayService.updateCharacteristic(
          this.platform.Characteristic.MotionDetected,
          false
        )
        this.whiteDayService.updateCharacteristic(
          this.platform.Characteristic.MotionDetected,
          true
        )
        this.redDayService.updateCharacteristic(
          this.platform.Characteristic.MotionDetected,
          false
        )
        break
      case 3:
        this.blueDayService.updateCharacteristic(
          this.platform.Characteristic.MotionDetected,
          false
        )
        this.whiteDayService.updateCharacteristic(
          this.platform.Characteristic.MotionDetected,
          false
        )
        this.redDayService.updateCharacteristic(
          this.platform.Characteristic.MotionDetected,
          true
        )
        break
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
