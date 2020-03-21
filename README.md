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
- Enable/Disable Siren
- Set Away Arm, Stay Arm, Disarm, Trigger (SOS) from Keyfob

# Recommended Hardware
- [Sonoff RF Bridge](https://sonoff.tech/product/accessories/433-rf-bridge  "Sonoff RF Bridge"): Flashed with Tasmota and used to receive 433Mhz RF Messages from sensors and convert to MQTT.
- [Indoor PIR Sensor](https://www.banggood.com/SONOFF-PIR2-Wireless-Infrared-Detector-Dual-Infrared-PIR-Motion-Sensor-Module-p-1227759.html "Sonoff Indoor PIR2 Sensor"): 433Mhz Wireless Indoor PIR - Model CT60
- [Outdoor PIR Sensor](https://www.banggood.com/PIR-Outdoor-Wireless-433-Waterproof-Infrared-Detector-Dual-Infrared-Motion-Sensor-For-Smart-Home-Security-Alarm-System-Work-With-SONOFF-RF-Bridge-433-p-1534707.html "Sonoff Outdoor PIR Sensor"): 433Mhz Wireless **Waterproof** Outdoor PIR - Model CT70
- [Digoo Door and Window Sensor](https://www.banggood.com/DIGOO-433MHz-New-Door-Window-Alarm-Sensor-for-HOSA-HAMA-Smart-Home-Security-System-Suit-Kit-p-1388985.html "Digoo Door and Window Sensor"): DIGOO 433MHz Door & Window Alarm Sensor
- [Digoo Siren](https://www.banggood.com/Digoo-DG-ROSA-433MHz-Wireless-Standalone-Alarm-Siren-Multi-function-Security-Systems-Host-p-1169577.html "DIGOO Siren"): DIGOO DG-ROSA 433MHz Wireless DIY Standalone Alarm Siren
- [Digoo Keyfob](https://www.banggood.com/DIGOO-DG-HOSA-Wireless-Remote-Controller-for-Smart-Home-Security-Alarm-System-Kits-p-1163122.html "DIGOO Keyfob"): DIGOO DG-HOSA Wireless Remote Controller (Black or White)

You need to link your Keyfob to both your Sonoff RF Bridge and the Siren. 
- Once linked to the RF Bridge you will be able to receive MQTT codes on the same topic [as other sensors] when you press a button, allowing you to arm and disarm from the keyfob.
    - To program link the remote to the RF Bridge publish the value `2` to `cmnd/rfbridge/rfkeyX` (replace X with a value from 1-4) then press the button on the remote you wish to link (e.g. Away Arm or SOS etc). 
- Once linked to the siren you will also be able to set and unset the siren from either the keyfob or Homekit. 

Note: NFC Tag Support (arm/disarm the without using the Home app) is not a feature of this plugin but can natively be activated through iOS Shortcuts. <sup>**</sup>

<sup>**Requires iOS 13 or above and Shortcuts app is required to create this automation.</sup>

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
5. [Configure](#Config-UI-X-Configuration) MQTT, Topics, Alarm Settings and Sensors

## Manual Installation via CLI
1. Drink a lot of coffee
2. From CLI: `npm install -g homebridge-homeqtt-alarm` (note: you may need to use `sudo`)
3. [Configure](#manual-configuration) MQTT, Topics, Alarm Settings and Sensors

# Configuration
Once the installation is complete you will need to configure the plugin.

## Config UI X Configuration
Once the plugin is installed you will be presented with the settings page to populate. This should be self explanatory however there is a table below explaining the fields.

![Homebridge_Settings](../media/homebridge_settings.png?raw=true)

| Settings Option             | config.json Value    | Required | Description                                                               | Type     | Default / Example Value  |
|-----------------------------|----------------------|:--------:|---------------------------------------------------------------------------|:--------:|--------------------------|
| Name                        | name                 | Yes      | Name of the alarm in HomeKit                                              | String   | Homeqtt                  |
| MQTT Broker URL:Port        | url                  | Yes      | URL and Port of your MQTT broker                                          | URL      | mqtt://URL:PORT          |
| MQTT Username               | username             | No       | Your MQTT Broker username (optional)                                      | String   | username                 |
| MQTT Password               | password             | No       | Your MQTT Broker password (optional)                                      | String   | password                 |
| MQTT Sensor Topic           | sensorTopic          | Yes      | Topic used to check for sensor activity                                   | String   | tele/rfbridge/RESULT     |
| Set Target State Topic      | setTargetStateTopic  | Yes      | Topic published when the target alarm state is changed in HomeKit         | String   | alarm/target             |
| Get Current State Topic     | getCurrentStateTopic | Yes      | Topic published to notify HomeKit of the current or triggered alarm state | String   | alarm/current            |
| Stay Arm                    | stayArm              | No       | Used when the home is occupied and residents are active                   | Boolean  | true / false             |
| Away Arm                    | awayArm              | No       | Used when the home is unoccupied                                          | Boolean  | true                     |
| Night Arm                   | nightArm             | No       | Used when the home is occupied and residents are sleeping                 | Boolean  | true / false             |
| Sensor Type                 | sensorType           | Yes      | Type of sensor                                                            | Dropdown | PIR / Contact Sensor     |
| Sensor Location             | sensorLocation       | Yes      | Location of the sensor                                                    | String   | Front Door               |
| Sensor MQTT Code            | sensorMQTTCode       | Yes      | Code sent to MQTT Server from sensor                                      | String   | 12345C                   |
| Enable Sensor               | sensorEnabled        | No       | Globally enable/disable this sensor                                       | Boolean  | true / false             |
| Allow Sensor for Stay Arm?  | sensorAllowStay      | No       | Usually ONLY entry-point sensors (e.g. doors and windows)                 | Boolean  | true / false             |
| Allow Sensor for Away Arm?  | sensorAllowAway      | No       | Usually ALL sensors                                                       | Boolean  | true / false             |
| Allow Sensor for Night Arm? | sensorAllowNight     | No       | Usually ALL entry-point sensors and SOME internal sensors                 | Boolean  | true / false             |
| Have Keyfob?               | keyfobEnabled        | No       | Enable or Disable a Keyfob                                                | Boolean  | true / false             |
| Keyfob Away Arm Topic       | keyfobAwayArmTopic   | No       | Topic published to notify HomeKit of a keyfob Away Arm button press       | String   | cmnd/rfbridge/rfkey1     |
| Keyfob Stay Arm Topic       | keyfobStayArmTopic   | No       | Topic published to notify HomeKit of a keyfob Stay Arm button press       | String   | cmnd/rfbridge/rfkey2     |
| Keyfob Disarm Topic         | keyfobDisarmTopic    | No       | Topic published to notify HomeKit of a keyfob Disarm button press         | String   | cmnd/rfbridge/rfkey3     |
| Keyfob SOS Topic            | keyfobSOSTopic       | No       | Topic published to notify HomeKit of a keyfob SOS button press            | String   | cmnd/rfbridge/rfkey4     |
| Keyfob Away Arm Code        | keyfobAwayArmCode    | No       | Enter the MQTT code received when pressing Lock button on a Keyfob        | String   | 12345L                   |
| Keyfob Stay Arm Code        | keyfobStayArmCode    | No       | Enter the MQTT code received when pressing Stay/Home button on a Keyfob   | String   | 12345H                   |
| Keyfob Disarm Code          | keyfobDisarmCode     | No       | Enter the MQTT code received when pressing Unlock button on a Keyfob      | String   | 12345U                   |
| Keyfob SOS Code             | keyfobSOSCode        | No       | Enter the MQTT code received when pressing SOS button on a Keyfob         | String   | 12345S                   |
| Enable Siren?               | sirenEnabled         | No       | Enable or Disable a Siren                                                 | Boolean  | true / false             |
| Additional Logging?         | debug                | No       | Ahow additional logging in Homebridge logs                                | Boolean  | true / false             |
| N/A (auto set by settings)  | accessory            | Yes      | Homebridge plugin accessory identifier                                    | String   | homebridge-homeqtt-alarm |

## Manual Configuration
If you are configuring the system manually you need to add an accessory block to your config.json:

<sup>Note: "accessory" **must** be set to *homebridge-homeqtt-alarm* in your config file or the plugin will not work.</sup>
```json
{
    "name": "Homeqtt",
    "accessory": "homebridge-homeqtt-alarm",
    "debug": true,
    "mqttOptions": {
        "url": "mqtt://xxx.xxx.xxx.xxx:xxxx"
    },
    "alarmTopics": {
        "sensorTopic": "",
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
    "sensors": [
        {
            "sensorType": "",
            "sensorLocation": "",
            "sensorMQTTCode": "",
            "sensorEnabled": true,
            "sensorAllowStay": true,
            "sensorAllowAway": true,
            "sensorAllowNight": true
        },
         {
            "sensorType": "",
            "sensorLocation": "",
            "sensorMQTTCode": "",
            "sensorEnabled": true,
            "sensorAllowStay": true,
            "sensorAllowAway": true,
            "sensorAllowNight": true
        }
    ],
    "keyfob": {
        "keyfobEnabled": true,
        "keyfobTopics":{
            "keyfobAwayArmTopic": "cmnd/rfbridge/rfkey1",
            "keyfobStayArmTopic": "cmnd/rfbridge/rfkey2",
            "keyfobDisarmTopic": "cmnd/rfbridge/rfkey3",
            "keyfobSOSTopic": "cmnd/rfbridge/rfkey4"
        },
        "keyfobMQTTCodes":{
            "keyfobAwayArmCode": "B74C81",
            "keyfobStayArmCode": "B74C84",
            "keyfobDisarmCode": "B74C82",
            "keyfobSOSCode": "B74C88"
        },
        "sirenEnabled": true
}
```
Add more **sensors** as required. 

For a populated example see the [example-config.json](https://github.com/nzbullet/homebridge-homeqtt-alarm/blob/master/example-config.json)

# Planned Features
See the [Changelog](https://github.com/nzbullet/homebridge-homeqtt-alarm/blob/master/CHANGELOG.md) for upcoming/planned features. 
