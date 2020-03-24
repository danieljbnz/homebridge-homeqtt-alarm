# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased / Planned Features
- Time delay before arm
- Time delay before disarm
- Sensor zones (group sensors into zones)
- Enable / disable by zone
- Option to override topic per sensor (would default to main sensorTopic). This allows you to get sensor activity from multiple topics.

## v3.0.0 - 2020-03-24
### Added
#### Keyfobs
- Enable/Disable keyfob (without removing config)
- Name Keyfob
- Add multiple Keyfobs (Max 4)
- Remove Keyfobs

#### Keyfob Buttons
- Add keyfob buttons (Max 4)
- Remove keyfob buttons
- Enable/Disable keyfob button (without removing config)
- Choose which alarm state the button activates (Stay Arm (Home), Away Arm, Night Arm, Disarm, SOS/Triggered)
- Set Button MQTT Code
- Button RF Key Topic (for use with siren)

### Changed
- Major re-write of code
- Updated variable names
- Siren option only shows if at least one keyfob is configured. 
- Update Homebridge Config UI X Settings Panel
- Update Readme, Changelog and example-config.json

## v2.0.2 - 2020-03-22
### Fixed
- Minor keyfob bug fixed where config was not applied

## Changed
- Code tidy-up
- Update Readme, Changelog and example-config.json

## v2.0.0 - 2020-03-21
### Added
Added Keyfob and Siren functionality :
  - Set alarm state from keyfob - Away Arm, Stay Arm, Disarm and Trigger(SOS)
  - Enable or disable siren (from Homebridge)
  - Set and trigger siren if enabled
  - Reset siren when alarm reset

Note: This is a re-write and as such you may need to re-add your Homeqtt config (e.g. Topics).

## v1.0.9 - 2020-02-25
### Changed
- Update Serial Number to match NPM Version

## v1.0.8 - 2020-02-24
### Changed
- Update README
- Add CHANGELOG

## v1.0.7 - 2020-02-24
### Fixed
- Code tidy up in index.js
- Comment tidy up in index.js
- Update Keywords in package.json

## v1.0.1:v1.0.6 - 2020-02-23
### Fixed
- Issue with package.json on NPM

## v1.0.0 - 2020-02-23
### Added
- Initial Commit

    **Features:**
    - Connect Homebridge to MQTT to receive messages to trigger alarm
    - Choose 'armed' states (e.g. Away Arm, Stay Arm, Night Arm)
    - Select sensor types (PIR or Contact Sensor)
    - Give sensors a location (i.e. a nice name)
    - Globally enable/disable individual sensors
    - Set sensors for only certain states
