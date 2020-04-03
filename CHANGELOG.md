# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased / Planned Features
- Time delay before arm
- Time delay before trigger
- Sensor zones (group sensors into zones)
- Enable / disable by zone
- Option to override topic per sensor (would default to 'messageTopic'). This allows you to get sensor activity from multiple topics.


## [v3.0.7](https://github.com/nzbullet/homebridge-homeqtt-alarm/compare/v3.0.6...v3.0.7) (2020-04-04)
### Fixed 
-  If a button state is enabled but the associated alarm state is disabled it would still fire the message. 
   -  This has been fixed and now a log message is received advsing that you pushed a button that's associated with a disabled state.
  
### Changed
- Debug messages are clearer.
- Only minimal log messages are shown if 'Debug' is not enable in your config.json
- Lots of code tidy up.
- Enabled [Wiki](https://github.com/nzbullet/homebridge-homeqtt-alarm/wiki) on Github
- Updated README to be static and moved detail to Wiki


## [v3.0.6](https://github.com/nzbullet/homebridge-homeqtt-alarm/compare/v3.0.5...v3.0.6) (2020-03-27)
### Changed
- Awesome new logo created and designed by [@mxdanger](https://github.com/mxdanger)

<a href="https://github.com/homebridge/homebridge/wiki/Verified-Plugins"><img alt="Homebridge Verified" src="https://raw.githubusercontent.com/nzbullet/homebridge-homeqtt-alarm/master/media/Homebridge%20x%20Homeqtt%20Alarm.svg?sanitize=true" width="250px"></a>

## [v3.0.5](https://github.com/nzbullet/homebridge-homeqtt-alarm/compare/v3.0.4...v3.0.5) (2020-03-26)
### Fixed 
-  If an invalid mqtt url is entered it will no longer shutdown Homebridge.

## [v3.0.4](https://github.com/nzbullet/homebridge-homeqtt-alarm/compare/v3.0.1...v3.0.4) (2020-03-26)
### Added
- Errors throw friendly log messages and the process stops gracefully.
- Added a minimum count of 1 to sensors.

**Setup via Config UI X settings or manually added to config.json:**
- If config not populated correctly or missing parameters then no Fatal Errors in Homebridge are thrown instead a message advising the config has been created but not populated correctly is added to the log and the process stops gracefully.


## [v3.0.1](https://github.com/nzbullet/homebridge-homeqtt-alarm/compare/v3.0.0...v3.0.1) (2020-03-25)
### Fixed
#### Keyfobs
- Keyfobs config not required if no keyfobs
- Siren config not required if no siren

## [v3.0.0](https://github.com/nzbullet/homebridge-homeqtt-alarm/compare/v2.0.2...v3.0.0) (2020-03-24)
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

## [v2.0.2](https://github.com/nzbullet/homebridge-homeqtt-alarm/compare/v2.0.0...v2.0.2) (2020-03-22)
### Fixed
- Minor keyfob bug fixed where config was not applied

## Changed
- Code tidy-up
- Update Readme, Changelog and example-config.json

## [v2.0.0](https://github.com/nzbullet/homebridge-homeqtt-alarm/compare/v1.0.9...v2.0.0) (2020-03-21)
### Added
Added Keyfob and Siren functionality :
  - Set alarm state from keyfob - Away Arm, Stay Arm, Disarm and Trigger(SOS)
  - Enable or disable siren (from Homebridge)
  - Set and trigger siren if enabled
  - Reset siren when alarm reset

## [v1.0.9](https://github.com/nzbullet/homebridge-homeqtt-alarm/compare/v1.0.8...v1.0.9) (2020-02-25)
### Changed
- Update Serial Number to match NPM Version

## [v1.0.8](https://github.com/nzbullet/homebridge-homeqtt-alarm/compare/v1.0.7...v1.0.8) (2020-02-24)
### Changed
- Update README
- Add CHANGELOG

## [v1.0.7](https://github.com/nzbullet/homebridge-homeqtt-alarm/compare/v1.0.6...v1.0.7) (2020-02-24)
### Fixed
- Code tidy up in index.js
- Comment tidy up in index.js
- Update Keywords in package.json

## [v1.0.1:v1.0.6](https://github.com/nzbullet/homebridge-homeqtt-alarm/compare/v1.0.0...v1.0.6) (2020-02-23)
### Fixed
- Issue with package.json on NPM

## [v1.0.0](https://github.com/nzbullet/homebridge-homeqtt-alarm/compare/v1.0.0...v1.0.0) (2020-02-23)
### Added
- Initial Commit

    **Features:**
    - Connect Homebridge to MQTT to receive messages to trigger alarm
    - Choose 'armed' states (e.g. Away Arm, Stay Arm, Night Arm)
    - Select sensor types (PIR or Contact Sensor)
    - Give sensors a location (i.e. a nice name)
    - Globally enable/disable individual sensors
    - Set sensors for only certain states
