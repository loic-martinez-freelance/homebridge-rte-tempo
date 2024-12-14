import { type PlatformAccessory, type Service } from 'homebridge'
import type { RteTempoPlatform } from './platform.js'

const HOURLY_RATE = 3600000
const MIN_RATE = 60000
const TENMIN_RATE = 600000
const ONESEC_RATE = 1000

export class RTETempoAccessory {
  private currentRTEColor: number = 0
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

  private startAccessory = async () => {
    this.platform.log.debug(
      'Selected refresh rate : ',
      this.platform.pluginConfig.refreshrate
    )
    this.platform.log.debug(
      'Selected switch rate : ',
      this.platform.pluginConfig.forceDetectorRefresh
    )

    setInterval(() => {
      if (this.platform.pluginConfig.refreshrate === 'hourly') {
        this.updateRTEColor()
      } else {
        const currentDate = new Date()
        const hours = currentDate.getHours()
        this.platform.log.debug('Current time : ', hours)
        if (hours === 1) {
          this.updateRTEColor()
        }
      }
    }, HOURLY_RATE)

    setInterval(
      () => {
        this.update()
      },
      this.platform.pluginConfig.forceDetectorRefresh === 'minutes'
        ? MIN_RATE
        : HOURLY_RATE
    )

    await this.updateRTEColor()
    this.update()
  }

  private update = () => {
    this.platform.log.info('Updating tempo color :', this.currentRTEColor)
    this.switchDetectorONOFF(
      this.blueDayService,
      this.currentRTEColor === 1 ? true : false
    )
    this.switchDetectorONOFF(
      this.whiteDayService,
      this.currentRTEColor === 2 ? true : false
    )
    this.switchDetectorONOFF(
      this.redDayService,
      this.currentRTEColor === 3 ? true : false
    )
  }

  private switchDetectorONOFF = (detector: Service, newValue: boolean) => {
    if (newValue) {
      detector.updateCharacteristic(
        this.platform.api.hap.Characteristic.MotionDetected,
        false
      )
      setTimeout(() => {
        detector.updateCharacteristic(
          this.platform.api.hap.Characteristic.MotionDetected,
          true
        )
      }, ONESEC_RATE)
    } else {
      detector.updateCharacteristic(
        this.platform.api.hap.Characteristic.MotionDetected,
        false
      )
    }
  }

  private updateRTEColor = async () => {
    this.currentRTEColor = await this.getRTEColor()
    if (this.currentRTEColor === 0) {
      this.platform.log.info('Update will retry in 10 minutes')
      setTimeout(() => {
        this.updateRTEColor()
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
