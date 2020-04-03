<p align="center">
  <a href="https://github.com/homebridge/homebridge/wiki/Verified-Plugins"><img alt="Homebridge Verified" src="https://raw.githubusercontent.com/nzbullet/homebridge-homeqtt-alarm/master/media/Homebridge%20x%20Homeqtt%20Alarm.svg?sanitize=true" width="500px"></a>
</p>

# Homeqtt Alarm
[![Downloads](https://img.shields.io/npm/dt/homebridge-homeqtt-alarm?color=blue&label=Downloads)](https://www.npmjs.com/package/homebridge-homeqtt-alarm)
[![NPM Version](https://img.shields.io/npm/v/homebridge-homeqtt-alarm/latest?label=NPM%20Version)](https://www.npmjs.com/package/homebridge-homeqtt-alarm)
[![License](https://img.shields.io/npm/l/homebridge-homeqtt-alarm?color=blue&label=License)](https://github.com/nzbullet/homebridge-homeqtt-alarm/blob/master/LICENSE)
[![Donate](https://img.shields.io/badge/Paypal-Donate-blue)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=QEFE9CFBZFVS4&currency_code=NZD&source=url)
[![Homebridge](https://img.shields.io/badge/Platform-Homebridge-blueviolet)](https://homebridge.io/)
[![MQTT](https://img.shields.io/badge/Platform-MQTT-blueviolet)](http://mqtt.org/)
[![verified-by-homebridge](https://img.shields.io/badge/Homebridge-Verified-blueviolet)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

<!-- [![Changelog](https://img.shields.io/badge/Github-Changelog-red)](https://github.com/nzbullet/homebridge-homeqtt-alarm/blob/master/CHANGELOG.md) -->

Homebridge MQTT Security Alarm Plugin for HomeKit.

This plugin sets up an alarm in HomeKit, then allows you to connect Homebridge to an MQTT server and with the received messages trigger the alarm in HomeKit (if it is armed).

# Features:
- Connect Homebridge to MQTT to receive messages to trigger alarm
- Choose 'armed' states (e.g. Away Arm, Stay Arm, Night Arm)
- Select sensor types (PIR or Contact Sensor)
- Give sensors a location (i.e. a nice name)
- Globally enable/disable individual sensors
- Set sensors for only certain states
- Set Away Arm, Stay Arm, Disarm from keyfob
- Enable/Disable siren
- Trigger the HomeKit alarm with the SOS button on the keyfob

# Prerequisites
1. You have [Homebridge](https://github.com/nfarina/homebridge  "Homebridge") Installed
2. You have an MQTT Server Running
3. Your MQTT server receives codes when sensors or keyfob button pushes are triggered
    <br><sup>(e.g. via 433Mhz contact sensor to Sonoff RF Bridge - see [Recommended Hardware](https://github.com/nzbullet/homebridge-homeqtt-alarm/wiki/Recommended-Hardware))</sup>

4. You have made a coffee

# Installation
There are two methods to this madness...
1. [Automated](https://github.com/nzbullet/homebridge-homeqtt-alarm/wiki/Installation#automated-installation-with-homebridge-config-ui-x) install and configuration via [Homebridge Config UI X](https://www.npmjs.com/package/homebridge-config-ui-x  "Homebridge Config UI X") [*recommended*]
2. [Manual](https://github.com/nzbullet/homebridge-homeqtt-alarm/wiki/Installation#manual-installation-via-cli) install via CLI and manually updating your Homebridge configuration file

# Configuration
Once the installation is complete you will need to configure the plugin: 
- [Config UI X Settings](https://github.com/nzbullet/homebridge-homeqtt-alarm/wiki/Configuration#config-ui-x-configuration) from your Homebridge instance.
- [Manually](https://github.com/nzbullet/homebridge-homeqtt-alarm/wiki/Configuration#manual-configuration) in your config.json.

# Planned Features
See the [Changelog](https://github.com/nzbullet/homebridge-homeqtt-alarm/blob/master/CHANGELOG.md) for upcoming/planned features.

<sup>Note: NFC Tag Support (arm/disarm via NFC without using the Home app) will not be a feature of this plugin but can natively be activated through iOS Shortcuts app and requires iOS 13 or above.</sup>

---
## See the [Wiki](https://github.com/nzbullet/homebridge-homeqtt-alarm/wiki) for more information
