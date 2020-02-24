# Homeqtt Alarm
[![Downloads](https://img.shields.io/npm/dt/homebridge-homeqtt-alarm?color=blue&label=Downloads)](https://www.npmjs.com/package/homebridge-homeqtt-alarm)
[![NPM Version](https://img.shields.io/npm/v/homebridge-homeqtt-alarm/latest?label=NPM%20Version)](https://www.npmjs.com/package/homebridge-homeqtt-alarm)
[![Changelog](https://img.shields.io/badge/Github-Changelog-red)](https://github.com/nzbullet/homebridge-homeqtt-alarm)
[![License](https://img.shields.io/npm/l/homebridge-homeqtt-alarm?color=blue&label=License)](https://github.com/nzbullet/homebridge-homeqtt-alarm/blob/master/LICENSE)
[![Donate](https://img.shields.io/badge/Paypal-Donate-blue)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=QEFE9CFBZFVS4&currency_code=NZD&source=url)
[![Homebridge](https://img.shields.io/badge/Platform-Homebridge-blueviolet)](https://homebridge.io/)
[![MQTT](https://img.shields.io/badge/Platform-MQTT-blueviolet)](http://mqtt.org/)

Homebridge MQTT Security Alarm Plugin for HomeKit

# Prerequisites 
1. You have [Homebridge](https://github.com/nfarina/homebridge  "Homebridge") Installed
2. You have an MQTT Server
3. Your MQTT server receives codes when sensors are triggered (e.g 433Mhz contact sensor to [Sonoff RF Bridge](https://sonoff.tech/product/accessories/433-rf-bridge  "Sonoff RF Bridge"))
4. You have made a coffee

# Installation
There are two methods to this madness... 
1. [Automated](#automated-installation-with-homebridge-config-ui-x) install and configuration via [Homebridge Config UI X](https://www.npmjs.com/package/homebridge-config-ui-x  "Homebridge Config UI X") [*recommended*]
2. [Manual](#manual-installation-via-cli) install via CLI and manually updating your Homebridge configuration file

## Automated Installation with Homebridge Config UI X
1. Open Homebridge Config UI X
2. Select **Plugins** and search for **Homeqtt Alarm**
3. Click **Install**
4. Drink your coffee
5. [Configure](#configuration) MQTT, Sensors, Alarm

## Manual Installation via CLI
1. Drink a lot of coffee

# Configuration
Once the installation is complete you will need to configure the plugin.

## Config UI X Configuration
Once the plugin is installed you will be presented with the settings page to populate. This should be self explanatory however there is a table below explaining the fields. 

## Manual Confguration
If you are configuring the system manually see the [example-config.json](https://github.com/nzbullet/homebridge-homeqtt-alarm/blob/master/example-config.json)

<sup>For manual installations: **"accessory"** must be set to *homebridge-homeqtt-alarm* in your config file or the plugin will not work.</sup>

# Fields
| Option               | Required | Description                                                                    | Type                      | Default / Value |
|----------------------|----------|--------------------------------------------------------------------------------|---------------------------|-----------------|
| Name                 | Yes      | Name of the alarm in HomeKit.                                                  | String                    | Homeqtt         |
| MQTT Broker URL:Port | Yes      | URL and Port of your MQTT broker                                               | URL                       | mqtt://URL:PORT |


# Coming Soon
See the [Changelog](https://github.com/nzbullet/homebridge-homeqtt-alarm/blob/master/CHANGELOG.md) for upcoming/planned features. 