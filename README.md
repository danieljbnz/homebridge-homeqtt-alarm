# Homeqtt Alarm
[![Downloads](https://img.shields.io/npm/dt/homebridge-homeqtt-alarm?color=blue&label=Downloads)](https://www.npmjs.com/package/homebridge-homeqtt-alarm)
[![NPM Version](https://img.shields.io/npm/v/homebridge-homeqtt-alarm/latest?label=NPM%20Version)](https://www.npmjs.com/package/homebridge-homeqtt-alarm)
[![Changelog](https://img.shields.io/badge/Github-Changelog-red)](https://github.com/nzbullet/homebridge-homeqtt-alarm/blob/master/CHANGELOG.md)
[![License](https://img.shields.io/npm/l/homebridge-homeqtt-alarm?color=blue&label=License)](https://github.com/nzbullet/homebridge-homeqtt-alarm/blob/master/LICENSE)
[![Donate](https://img.shields.io/badge/Paypal-Donate-blue)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=QEFE9CFBZFVS4&currency_code=NZD&source=url)
[![Homebridge](https://img.shields.io/badge/Platform-Homebridge-blueviolet)](https://homebridge.io/)
[![MQTT](https://img.shields.io/badge/Platform-MQTT-blueviolet)](http://mqtt.org/)

![Homeqtt_Alarm](../media/homeqtt_logo_300.png?raw=true)

Homebridge MQTT Security Alarm Plugin for HomeKit.

This plugin sets up an alarm in HomeKit, then allows you to connect Homebridge to an MQTT server and with the recieved messages trigger the alarm in HomeKit (if it is armed).

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

Note: NFC Tag Support (arm/disarm the without using the Home app) is not a feature of this plugin but can natively be activated through iOS Shortcuts. <sup>**</sup>

<sup>**Requires iOS 13 or above and Shortcuts app is required to create this automation.</sup>

# Recommended Hardware
- [Sonoff RF Bridge](https://sonoff.tech/product/accessories/433-rf-bridge  "Sonoff RF Bridge"): Flashed with Tasmota. Receives 433Mhz RF Messages from sensors and sends to MQTT.
- [Indoor PIR Sensor](https://www.banggood.com/SONOFF-PIR2-Wireless-Infrared-Detector-Dual-Infrared-PIR-Motion-Sensor-Module-p-1227759.html "Sonoff Indoor PIR2 Sensor"): 433Mhz Wireless Indoor PIR - Model CT60
- [Outdoor PIR Sensor](https://www.banggood.com/PIR-Outdoor-Wireless-433-Waterproof-Infrared-Detector-Dual-Infrared-Motion-Sensor-For-Smart-Home-Security-Alarm-System-Work-With-SONOFF-RF-Bridge-433-p-1534707.html "Sonoff Outdoor PIR Sensor"): 433Mhz Wireless **Waterproof** Outdoor PIR - Model CT70
- [Digoo Door and Window Sensor](https://www.banggood.com/DIGOO-433MHz-New-Door-Window-Alarm-Sensor-for-HOSA-HAMA-Smart-Home-Security-System-Suit-Kit-p-1388985.html "Digoo Door and Window Sensor"): DIGOO 433MHz Door & Window Alarm Sensor
- [Digoo Siren](https://www.banggood.com/Digoo-DG-ROSA-433MHz-Wireless-Standalone-Alarm-Siren-Multi-function-Security-Systems-Host-p-1169577.html "DIGOO Siren"): DIGOO DG-ROSA 433MHz Wireless DIY Standalone Alarm Siren
- [Digoo Keyfob](https://www.banggood.com/DIGOO-DG-HOSA-Wireless-Remote-Controller-for-Smart-Home-Security-Alarm-System-Kits-p-1163122.html "DIGOO Keyfob"): DIGOO DG-HOSA Wireless Remote Controller (Black or White)

## Keyfob and Siren:
- Maximum of 4 Keyfobs can be linked to the RF Bridge
- You *don't* need to have a siren to use a keyfob with HomeKit, however, you *do* need to have a keyfob to use a siren
- The Sonoff RF Bridge will receive codes from a keyfob on the same topic as the sensors without any linking. 
- If you have a siren you need to link your Keyfob to **both** your Sonoff RF Bridge and the Siren. 
    - Once linked you will be able to arm, disarm or trigger the siren from the keyfob and/or HomeKit.
    - To link the keyfob to the siren follow the instructions of the siren
    - To link the remote to the RF Bridge (to be able to use the siren with HomeKit) publish the value `2` to `cmnd/rfbridge/rfkeyX` (replace X with a value from 1-16) then press the button on the remote you wish to link (e.g. Away Arm or SOS etc). 

# Prerequisites 
1. You have [Homebridge](https://github.com/nfarina/homebridge  "Homebridge") Installed
2. You have an MQTT Server Running
3. Your MQTT server receives codes when sensors are triggered (e.g 433Mhz contact sensor to Sonoff RF Bridge) - See [Recommended Hardware](#recommended-hardware) above)
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
5. [Configure](#Config-UI-X-Configuration) MQTT, Alarm Topics, Alarm Settings, Sensors, Keyfob and Siren

## Manual Installation via CLI
1. Drink a lot of coffee
2. From CLI: `npm install -g homebridge-homeqtt-alarm` (note: you may need to use `sudo`)
3. [Configure](#manual-configuration) MQTT, Alarm Topics, Alarm Settings, Sensors, Keyfob and Siren

# Configuration
Once the installation is complete you will need to configure the plugin.

## Config UI X Configuration
Once the plugin is installed you will be presented with the settings page to populate. This should be self explanatory however there is a table below explaining the fields.

![Homebridge_Settings](../media/homebridge_settings.png?raw=true)

| Settings Option             | config.json Value                | Required | Description                                                               | Type     | Default / Example Value  |
|-----------------------------|----------------------------------|:--------:|---------------------------------------------------------------------------|:--------:|--------------------------|
| Name                        | name                             | Yes      | Name of the alarm in HomeKit                                              | String   | Homeqtt                  |
| N/A (auto set by settings)  | accessory                        | Yes      | Homebridge plugin accessory identifier                                    | String   | homebridge-homeqtt-alarm |
| MQTT Broker URL:Port        | mqttConfig/url                   | Yes      | URL and Port of your MQTT broker                                          | URL      | mqtt://URL:PORT          |
| MQTT Username               | mqttConfig/username              | No       | Your MQTT Broker username (optional)                                      | String   | username                 |
| MQTT Password               | mqttConfig/password              | No       | Your MQTT Broker password (optional)                                      | String   | password                 |
| MQTT Sensor Topic           | alarmTopics/messageTopic         | Yes      | Topic used to check for messages from sensor and keyfob activity          | String   | tele/rfbridge/RESULT     |
| Set Target State Topic      | alarmTopics/setTargetStateTopic  | Yes      | Topic published when the target alarm state is changed in HomeKit         | String   | alarm/target             |
| Get Current State Topic     | alarmTopics/getCurrentStateTopic | Yes      | Topic published to notify HomeKit of the current or triggered alarm state | String   | alarm/current            |
| Stay Arm                    | alarmSettings/stayArm            | No       | Used when the home is occupied and residents are active                   | Boolean  | true / false             |
| Away Arm                    | alarmSettings/awayArm            | No       | Used when the home is unoccupied                                          | Boolean  | true / false             |
| Night Arm                   | alarmSettings/nightArm           | No       | Used when the home is occupied and residents are sleeping                 | Boolean  | true / false             |
| Sensor Type                 | sensor/sensorType                | Yes      | Type of sensor                                                            | Dropdown | PIR / Contact Sensor     |
| Sensor Location             | sensor/location                  | Yes      | Location of the sensor                                                    | String   | Front Door               |
| Sensor MQTT Code            | sensor/MQTTCode                  | Yes      | Code sent to MQTT Server from sensor                                      | String   | 12345C                   |
| Enable Sensor               | sensor/enabled                   | No       | Globally enable/disable this sensor                                       | Boolean  | true / false             |
| Allow Sensor for Stay Arm?  | sensor/allowStay                 | No       | Usually ONLY entry-point sensors (e.g. doors and windows)                 | Boolean  | true / false             |
| Allow Sensor for Away Arm?  | sensor/allowAway                 | No       | Usually ALL sensors                                                       | Boolean  | true / false             |
| Allow Sensor for Night Arm? | sensor/allowNight                | No       | Usually ALL entry-point sensors and SOME internal sensors                 | Boolean  | true / false             |
| Do you have a Keyfob?       | keyfob                           | No       | Show/hide keyfob settings                                                 | Boolean  | true / false             |
| Keyfob Enabled?             | keyfob/enabled                   | No       | Enable or disable keyfob                                                  | Boolean  | true / false             |
| Keyfob Name                 | keyfob/name                      | No       | Friendly name of your keyfob                                              | String   | Dad Keyfob               |
| Enable Button?              | keyfobs/buttons/enabled          | No       | Enable or disable button                                                  | Boolean  | true / false             |
| Button Alarm State          | keyfobs/buttons/alarmState       | No       | Alarm state sent when button pressed (state must be enabled in Alarm Settings) | Integer | 0, 1, 2, 3, 4   |
| Button MQTT Code            | keyfobs/buttons/MQTTCode         | No       | Enter the MQTT code received when pressing button on keyfob               | String   | 12345L                   |
| RFKey Topic                 | keyfobs/buttons/rfkeyTopic       | No       | RFKey topic published to notify siren of a state change (required to set/trigger siren from Homekit) | String   | cmnd/rfbridge/rfkey1 |
| Enable Siren?               | siren/enabled                    | No       | Enable or disable a siren (only available if keyfob enabled)              | Boolean  | true / false             |
| Additional Logging?         | debug                            | No       | Ahow additional logging in Homebridge logs                                | Boolean  | true / false             |

## Manual Configuration
If you are configuring the system manually you need to add an accessory block to your config.json:

<sup>Note: "accessory" **must** be set to *homebridge-homeqtt-alarm* in your config file or the plugin will not work.</sup>
```json
{
    "name": "Homeqtt",
    "accessory": "homebridge-homeqtt-alarm",
    "debug": false,
    "mqttConfig": {
        "url": "mqtt://xxx.xxx.xxx.xxx:xxxx"
    },
    "alarmTopics": {
        "messageTopic": "",
        "setTargetStateTopic": "",
        "getCurrentStateTopic": ""
    },
    "alarmSettings": {
        "targetStates": {
            "stayArm": true,
            "awayArm": true,
            "nightArm": true
        }
    },
    "sensor": [
        {
            "sensorType": "",
            "location": "",
            "MQTTCode": "",
            "enabled": true,
            "allowStay": true,
            "allowAway": true,
            "allowNight": true
        },
        {
            "sensorType": "",
            "location": "",
            "MQTTCode": "",
            "enabled": true,
            "allowStay": true,
            "allowAway": true,
            "allowNight": true
        }
    ],
    "keyfob": false,
    "keyfobs": [
        {
            "enabled": false,
            "name": "",
            "buttons": [
                {
                    "enabled": false,
                    "alarmState": integer,
                    "MQTTCode": "",
                    "rfkeyTopic": ""
                },
                {
                    "enabled": false,
                    "alarmState": integer,
                    "MQTTCode": "",
                    "rfkeyTopic": ""
                }
            ]
        },
        {
            "enabled": false,
            "name": "",
            "buttons": [
                {
                    "enabled": false,
                    "alarmState": integer,
                    "MQTTCode": "",
                    "rfkeyTopic": ""
                },
                {
                    "enabled": false,
                    "alarmState": integer,
                    "MQTTCode": "",
                    "rfkeyTopic": ""
                }
            ]
        }
    ],
    "siren": {
        "enabled": false
    }
}
```
Add more **sensors** and **keyfobs** (max 4) as required. 

This is a basic example. For a fully populated example see the [example-config.json](https://github.com/nzbullet/homebridge-homeqtt-alarm/blob/master/example-config.json)

# HomeKit Alarm States
HomeKit alarm states are mapped as follows:
| Characteristic State  | Integer Value| iOS Home Value | Description                                               |
|-----------------------|:------------:|----------------|-----------------------------------------------------------|
| STAY_ARM              | 0            | Home           | Used when the home is occupied and residents are active   |
| AWAY_ARM              | 1            | Away           | Used when the home is unoccupied                          |
| NIGHT_ARM             | 2            | Night          | Used when the home is occupied and residents are sleeping |
| DISARM / DISARMED     | 3            | Off            | Alarm is switched off                                     |
| ALARM_TRIGGERED       | 4            | Triggered      | Alarm has been triggered                                  |

# Planned Features
See the [Changelog](https://github.com/nzbullet/homebridge-homeqtt-alarm/blob/master/CHANGELOG.md) for upcoming/planned features. 
 