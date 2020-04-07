var Service, Characteristic;
var mqtt = require('mqtt');
const packageJson = require('./package.json');

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;

	homebridge.registerAccessory('homebridge-homeqtt-alarm', 'homebridge-homeqtt-alarm', homeqttAlarmAccessory);
};

// State and Command Payloads
const stateStayArm = 'STAY_ARM'; // 0
const stateAwayArm = 'AWAY_ARM'; // 1
const stateNightArm = 'NIGHT_ARM'; // 2
const stateDisarmed = 'DISARMED'; // 3
const stateDisarm = 'DISARM'; // 3
const stateTriggered = 'ALARM_TRIGGERED'; // 4

const commandStayArm = 0; // STAY_ARM = 0
const commandAwayArm = 1; // AWAY_ARM = 1
const commandNightArm = 2; // NIGHT_ARM = 2
const commandDisarmed = 3; // DISARMED = 3
const commandTriggered = 4; // ALARM_TRIGGERED = 4

function stateName(msg) {
	switch (msg) {
		case commandStayArm:
			msg = stateStayArm;
			break;
		case commandAwayArm:
			msg = stateAwayArm;
			break;
		case commandNightArm:
			msg = stateNightArm;
			break;
		case commandDisarmed:
			msg = stateDisarmed;
			break;
		case commandTriggered:
			msg = stateTriggered;
			break;
		default:
			msg = null;
			break;
	}
	return msg;
}

function getAllowedTargetStates(targetStates) {
	var allowedTargetStates = [3]; // Always have disarmed
	for (var state in targetStates) {
		if (targetStates[state]) {
			if (state == 'stayArm') {
				state = 0;
				allowedTargetStates.push(state);
			}
			if (state == 'awayArm') {
				state = 1;
				allowedTargetStates.push(state);
			}
			if (state == 'nightArm') {
				state = 2;
				allowedTargetStates.push(state);
			}
		}
	}
	return allowedTargetStates;
}

function homeqttAlarmAccessory(log, config) {
	this.log = log;

	// System Settings
	this.manufacturer = '@nzbullet';
	this.model = 'Homeqtt Alarm';

	// No Config Exit
	if (!config) {
		return;
	}
	// Debug (Extra logging)
	if (config.debug === true) {
		this.debug = log;
	} else {
		this.debug = function () {};
	}

	// Name of sensor in HomeKit (Defaults to 'Homeqtt')
	if (!config.name) {
		this.name = 'Homeqtt';
		this.debug('Setup: Name not provided. Default name being used - Homeqtt');
	}

	// Homebridge Accessory
	if (!config.accessory) {
		config.accessory = 'homebridge-homeqtt-alarm';
	}

	// MQTT Config
	if (config.mqttConfig) {
		var url = config.mqttConfig.url;
		var username = config.mqttConfig.username;
		var password = config.mqttConfig.password;
		if (!url) {
			log('Stopping: You have not set your MQTT Server URL in your config.json');
			return; // Error
		} else {
			var mqttClientId = config.name.replace(/[^\x20-\x7F]/g, "") + '_' + Math.random().toString(16).substr(2, 8);
			var mqttBroker = url; // MQTT Broker URL and Port
			var options = {
				keepalive: 45,
				clientId: mqttClientId,
				protocolId: 'MQTT',
				protocolVersion: 4,
				clean: true,
				reconnectPeriod: 1000,
				connectTimeout: 30 * 1000,
				will: {
					topic: 'WillMsg',
					payload: 'Connection closed abnormally!',
					qos: 0,
					retain: false
				},
				username: username,
				password: password,
				rejectUnauthorized: false
			};
			// Connect to MQTT 
			try {
				this.client = mqtt.connect(mqttBroker, options);
			} catch (err) {
				log(err); // Not shown in the log ever
				return;
			}
		}
	} else {
		log('Stopping: You have not setup your MQTT Config in your config.json');
		return; // Error
	}

	// Set 'that' to 'this' to be able to access global 'this' inside 'this'
	var that = this;

	// MQTT Errors
	this.client.stream.on('error', (err) => {
		if (config.debug === true) {
			that.debug('MQTT', err);
		} else {
			log('MQTT Error. Please check you config.json or broker. For more detail enable debug.');
		}
		this.client.end();
		return;
	});
	this.client.on('error', (err) => {
		log('Error event on MQTT: ', err);
		this.client.end();
	});

	// MQTT Topics (does not include RF Key Topics)
	if (config.alarmTopics) {
		this.alarmTopics = config.alarmTopics; // All Topics
		this.messageTopic = config.alarmTopics.messageTopic; // Message Topic
		this.setTargetStateTopic = config.alarmTopics.setTargetStateTopic; // Target State Topic
		this.getCurrentStateTopic = config.alarmTopics.getCurrentStateTopic; // Current State Topic
		// Set Default Topics if missing
		if (!this.messageTopic) { // Message Topic Blank
			config.alarmTopics.messageTopic = 'tele/rfbridge/RESULT';
			this.messageTopic = config.alarmTopics.messageTopic;
			that.debug('Setup: Message topic not provided. Default being used: tele/rfbridge/RESULT');
		}
		if (!this.setTargetStateTopic) { // Target State Topic
			config.alarmTopics.setTargetStateTopic = 'alarm/target';
			this.setTargetStateTopic = config.alarmTopics.setTargetStateTopic;
			that.debug('Setup: Target State topic not provided. Default being used: alarm/target');
		}
		if (!this.getCurrentStateTopic) { // Current State Topic
			config.alarmTopics.getCurrentStateTopic = 'alarm/current';
			this.getCurrentStateTopic = config.alarmTopics.getCurrentStateTopic;
			that.debug('Setup: Current State topic not provided. Default being used: alarm/current');
		}
	} else {
		log('Stopping: You have not setup your Alarm Topics in your config.json');
		return; // Error
	}

	// Alarm Settings
	if (config.alarmSettings) {
		this.alarmSettings = config.alarmSettings;
		if (this.alarmSettings.targetStates) {
			this.targetStates = config.alarmSettings.targetStates;
		} else {
			log('Stopping: You have not setup targetStates in your config.json');
			return false;
		}
	} else {
		log('Stopping: You have not setup alarmSettings in your config.json');
		return; // Error
	}
	// Sensors
	if (config.sensor) {
		this.sensor = config.sensor; // All Sensors Object
	} else {
		log('Stopping: You have not setup your Sensors in your config.json');
		return; // Error
	}
	// Keyfob
	if (config.keyfob) {
		this.keyfob = config.keyfob;
		if (config.keyfobs) {
			this.keyfobs = config.keyfobs;
			// Buttons
			if (config.keyfobs.buttons) {
				this.buttons = config.keyfobs.buttons;
			}
		}
	} else {
		this.keyfob = false;
	}
	// Siren
	if (config.siren) {
		this.siren = config.siren;
	} else {
		this.siren.enabled = false;
	}

	// Connect and Subscribe to all topics on connect
	this.client.on('connect', function () {
		// Show MQTT Options in log
		that.debug('Setup: MQTT Broker: ' + mqttBroker);
		if (that.keyfob) {
			that.debug('Setup: Keyfob Available');
		}
		if (that.siren.enabled) {
			that.debug('Setup: Siren Enabled');
		} else {
			that.debug('Setup: Siren Disabled');
		}
		for (let topic in that.alarmTopics) {
			if (topic) {
				that.client.subscribe(that.alarmTopics[topic]);
				that.debug('Setup: Connected and subscribed to:', that.alarmTopics[topic]);
			}
		}
		if (that.keyfob) {
			for (let keyfob in that.keyfobs) {
				if (keyfob) {
					let buttons = that.keyfobs[keyfob].buttons;
					if (that.keyfobs[keyfob].enabled) {
						for (let button in buttons) {
							if (button) {
								button = buttons[button];
								if (button.enabled) {
									let allowedTargetStates = getAllowedTargetStates(that.targetStates);
									if (allowedTargetStates.includes(button.alarmState) || button.alarmState === 4) {
										let state = stateName(button.alarmState);
										if (button.rfkeyTopic) {
											that.client.subscribe(button.rfkeyTopic);
											that.debug('Setup: Connected and subscribed to RFKey topic:', button.rfkeyTopic);
										} else {
											log('Warning:', state, 'Button RFKey Topic has not been provided in config.json for', keyfob.name);
											return;
										}
									}
								}
							}
						}
					}
				}
			}
		}
		// Enable States
		var targetstates = Object.keys(that.targetStates).filter(key => that.targetStates[key]);
		that.debug('Setup: Enabled Alarm States -', targetstates);
		log('Setup Complete');
	});
	// MQTT Message Received
	this.client.on('message', function (topic, msg) {
		var message = msg.toString();
		// Set HomeKit Alarm based on Keyfob Button presses
		if (that.keyfob && topic === that.messageTopic) {
			for (let keyfob in that.keyfobs) {
				if (keyfob) {
					let buttons = that.keyfobs[keyfob].buttons;
					if (that.keyfobs[keyfob].enabled) {
						for (let button in buttons) {
							if (button) {
								button = buttons[button];
								if (button.enabled && message.indexOf(button.MQTTCode) !== -1) {
									let state = stateName(button.alarmState);
									that.debug('Keyfob Button Pressed:', state, '(', button.alarmState, ')');
									if (state === 'ALARM_TRIGGERED') {
										that.securityService.setCharacteristic(Characteristic.SecuritySystemCurrentState, commandTriggered);
										that.client.publish(that.getCurrentStateTopic, stateTriggered);
										if (that.keyfob && that.siren.enabled) {
											log('Siren Status: Triggered');
										}
										log('SOS Triggered: Keyfob SOS Button Pressed');
									}
									if (state !== 'ALARM_TRIGGERED') {
										let allowedTargetStates = getAllowedTargetStates(that.targetStates);
										if (allowedTargetStates.includes(button.alarmState)) {
											that.securityService.setCharacteristic(Characteristic.SecuritySystemTargetState, button.alarmState);
										} else {
											that.debug('Button pressed:', state, '- Alarm state not enabled in HomeKit');
										}
									}
								}
							}
						}
					}
				}
			}
		}
		// Current state or target state topic messages (setting the state)
		if (topic === that.getCurrentStateTopic || topic === that.setTargetStateTopic) {
			that.debug('Topic:', topic);
			log('Alarm State:', message);
			switch (message) {
				case stateStayArm:
					message = commandStayArm;
					break;
				case stateAwayArm:
					message = commandAwayArm;
					break;
				case stateNightArm:
					message = commandNightArm;
					break;
				case stateDisarmed:
					message = commandDisarmed;
					break;
				case stateDisarm:
					message = commandDisarmed;
					break;
				case stateTriggered:
					message = commandTriggered;
					break;
				default:
					message = null;
					break;
			}
			// Set HomeKit state to alarm state
			if (message !== null) {
				that.readstate = message;
				that.securityService.getCharacteristic(Characteristic.SecuritySystemCurrentState, that.readstate);
				// Set Siren State if siren enabled
				var set = 0;
				while (set < 1) {
					if (that.keyfob && that.siren.enabled) {
						for (let keyfob in that.keyfobs) {
							if (keyfob) {
								if (that.keyfobs[keyfob].enabled) {
									let buttons = that.keyfobs[keyfob].buttons;
									for (let button in buttons) {
										if (button) {
											button = buttons[button];
											if (button.enabled && button.alarmState === that.readstate) {
												let state = stateName(button.alarmState);
												let allowedTargetStates = getAllowedTargetStates(that.targetStates);
												if (allowedTargetStates.includes(button.alarmState) || that.readstate === 4) {
													that.client.publish(button.rfkeyTopic, button.MQTTCode);
													set++;
													that.debug('MQTT Code', button.MQTTCode, 'published to', button.rfkeyTopic);
												} else {
													that.debug('Button pressed:', state, '- Alarm state not enabled in HomeKit. MQTT Code not sent.');
												}
											}
										}
									}
								}
								if (set === 1) {
									break;
								}
							}
						}
					}
					break;
				}
				if (config.debug === true) {
					let allowedTargetStates = getAllowedTargetStates(that.targetStates);
					if (allowedTargetStates.includes(that.readstate) || that.readstate === 4) {
						let sirenState = stateName(that.readstate);
						that.debug('Siren Status:', sirenState);
					}
				}
			}
		}
		// Trigger Alarm Function
		function triggerAlarm() {
			// MQTT Publish Triggered 
			that.client.publish(that.setTargetStateTopic, stateTriggered);
			// Trigger Alarm in HomeKit
			that.securityService.setCharacteristic(Characteristic.SecuritySystemCurrentState, commandTriggered);
			// Trigger Siren if enabled
			var trigger = 0;
			while (trigger < 1) {
				if (that.keyfob && that.siren.enabled) {
					for (let keyfob in that.keyfobs) {
						if (keyfob) {
							if (that.keyfobs[keyfob].enabled) {
								let buttons = that.keyfobs[keyfob].buttons;
								for (let button in buttons) {
									if (button) {
										button = buttons[button];
										if (button.enabled && button.alarmState === commandTriggered) {
											that.client.publish(button.rfkeyTopic, button.MQTTCode);
											log('Siren Triggered');
											trigger++;
										}
									}
								}
							}
							if (trigger === 1) {
								break;
							}
						}
					}
				}
				break;
			}
		}
		// Sensor topic messages (triggered messages)
		if (topic == that.messageTopic) {
			for (let sensor in that.sensor) {
				if (sensor) {
					sensor = that.sensor[sensor];
					// Sensor is in MQTT message
					if (message.indexOf(sensor.MQTTCode) !== -1) {
						// Sensor is enabled and alarm is not Disarmed
						if (sensor.enabled && that.readstate != 3) {
							// If sensor is allowed in the enabled state (and alarm is triggered)
							if (sensor.allowStay && that.readstate == 0 || sensor.allowAway && that.readstate == 1 || sensor.allowNight && that.readstate == 2) {
								triggerAlarm();
								log('Sensor Triggered:', sensor.location, '(', sensor.MQTTCode, ')');
							}
						}
					}
				}
			}
		}
	});
}

homeqttAlarmAccessory.prototype = {
	// Get and Set states
	setTargetState: function (state, callback) {
		let mqttstate = stateName(state);
		// MQTT Publish State 
		this.client.publish(this.getCurrentStateTopic, mqttstate, {
			qos: 0,
			retain: true
		});
		this.debug('Setting state to:', mqttstate, '(', state, ')');
		this.securityService.setCharacteristic(Characteristic.SecuritySystemCurrentState, state);
		callback(null, state);
	},

	getState: function (get, callback) {
		let state = stateName(this.readstate);
		if (this.readstate == '0' || this.readstate == '1' || this.readstate == '2' || this.readstate == '3') {
			if (get == 'current') {
				this.debug('Current Alarm State:', state, '(', this.readstate, ')');
			}
			if (get == 'target') {
				this.debug('Target Alarm State:', state, '(', this.readstate, ')');
			}
			callback(null, this.readstate);
		} else if (this.readstate == '4') {
			if (get == 'current') {
				this.debug('Current Alarm State:', state, '(', this.readstate, ')');
			}
			callback(null);
		} else if (this.readstate === undefined) {
			// Set initial state to disarmed when Homebridge first starts
			this.readstate = 3;
			this.debug('Setting initial HomeKit state to DISARMED (', this.readstate, ')');
			callback(null, this.readstate);
		} else {
			this.debug('Received an invalid HomeKit State:', this.readstate, '- Should be one of 0,1,2,3,4. Please check your config.json for errors.');
			callback('error');
		}
	},

	getCurrentState: function (callback) {
		let get = 'current';
		this.getState(get, callback);
	},

	getTargetState: function (callback) {
		let get = 'target';
		this.getState(get, callback);
	},

	identify: function (callback) {
		this.log('Identify requested!');
		callback(); // success
	},

	getServices: function () {
		// Set accessory information
		var informationService = new Service.AccessoryInformation();
		informationService.setCharacteristic(Characteristic.Manufacturer, this.manufacturer);
		informationService.setCharacteristic(Characteristic.Model, this.model);
		informationService.setCharacteristic(Characteristic.SerialNumber, packageJson.version);
		this.securityService = new Service.SecuritySystem(this.name);
		this.securityService
			.getCharacteristic(Characteristic.SecuritySystemCurrentState)
			.on('get', this.getCurrentState.bind(this));
		// Set allowed target states
		let allowedTargetStates = getAllowedTargetStates(this.targetStates);
		let characteristic = this.securityService.getCharacteristic(Characteristic.SecuritySystemTargetState);
		characteristic.props.validValues = allowedTargetStates; // (needs to be a number array e.g. [0,1,2,3])
		this.securityService
			.getCharacteristic(Characteristic.SecuritySystemTargetState)
			.on('get', this.getTargetState.bind(this))
			.on('set', this.setTargetState.bind(this));
		return [informationService, this.securityService];
	}
};