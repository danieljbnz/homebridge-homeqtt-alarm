var Service, Characteristic;
var mqtt = require("mqtt");
const packageJson = require('./package.json')

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;

	homebridge.registerAccessory("homebridge-homeqtt-alarm", "homebridge-homeqtt-alarm", homeqttAlarmAccessory);
}

function homeqttAlarmAccessory(log, config) {
	// Default Variables
	this.log = log

	// System Settings
	this.manufacturer = '@nzbullet'
	this.model = 'Homeqtt Alarm'

	// State and Command Payloads
	this.stateStayArm = 'STAY_ARM'; // 0
	this.stateAwayArm = 'AWAY_ARM'; // 1
	this.stateNightArm = 'NIGHT_ARM'; // 2
	this.stateDisarmed = 'DISARMED'; // 3
	this.stateDisarm = 'DISARM'; // 3
	this.stateTriggered = 'ALARM_TRIGGERED'; // 4

	this.commandStayArm = 0 // 'STAY_ARM';
	this.commandAwayArm = 1 // 'AWAY_ARM';
	this.commandNightArm = 2 //' NIGHT_ARM';
	this.commandDisarmed = 3 // 'DISARMED';
	this.commandTriggered = 4 // 'ALARM_TRIGGERED';

	// Load data from config.json
	// Name of sensor in HomeKit (Defaults to 'Homeqtt')
	if (!config.name) {
		this.name = 'Homeqtt'
		log('Setup: Name not provided. Default name being used - Homeqtt')
	}
	// Homebridge Accessory
	if (!config.accessory) {
		config.accessory = 'homebridge-homeqtt-alarm'
	}
	// Debug (Extra logging)
	if (config.debug) {
		this.debug = config.debug;
	} else {
		config.debug = false;
		this.debug = config.debug;
	}
	// MQTT Config
	if (config.mqttConfig) {
		this.mqttConfig = config.mqttConfig
		if (!config.mqttConfig.url) {
			log('Stopping: You have not set your MQTT Server URL in your config.json')
			return; // Error
		}
	} else {
		log('Stopping: You have not setup your MQTT Config in your config.json')
		return; // Error
	}
	// MQTT Broker connection settings
	if (this.mqttConfig && config.mqttConfig.url) {
		var mqttClientId = config.name.replace(/[^\x20-\x7F]/g, "") + '_' + Math.random().toString(16).substr(2, 8);
		var mqttBroker = config.mqttConfig.url // MQTT Broker URL and Port
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
			username: config.mqttConfig.username,
			password: config.mqttConfig.password,
			rejectUnauthorized: false
		};
		// Show MQTT Options in log
		if (this.debug) {
			log('Setup: MQTT Broker: ' + mqttBroker);
			log('Setup: MQTT Options: ' + JSON.stringify(options, function (key, value) {
				if (key == "password") {
					return undefined; // filter out
				}
				return value;
			}));
		}
		// Connect to MQTT
		try {
			this.client = mqtt.connect(mqttBroker, options);
		} catch (e) {
			log.error(e);
			return;
		}
		// MQTT Connection Error
		this.client.on('error', function () {
			log('Error event on MQTT');
		});
	} else {
		log('Stopping: MQTT Has not been set up in config.json')
		return; // Error
	}
	// MQTT Topics
	if (config.alarmTopics) {
		// Settings Topics (does not include RF Key Topics)
		this.alarmTopics = config.alarmTopics
		// Message Topic
		if (!config.alarmTopics.messageTopic) {
			config.alarmTopics.messageTopic = 'tele/rfbridge/RESULT'
			this.messageTopic = config.alarmTopics.messageTopic
			log('Setup: Message topic not provided. Default being used: tele/rfbridge/RESULT')
		}
		// Target State Topic
		if (!config.alarmTopics.setTargetStateTopic) {
			config.alarmTopics.setTargetStateTopic = 'alarm/target'
			this.setTargetStateTopic = config.alarmTopics.setTargetStateTopic
			log('Setup: Target State topic not provided. Default being used: alarm/target')
		}
		// Current State Topic
		if (!config.alarmTopics.getCurrentStateTopic) {
			config.alarmTopics.getCurrentStateTopic = 'alarm/current'
			this.getCurrentStateTopic = config.alarmTopics.getCurrentStateTopic
			log('Setup: Current State topic not provided. Default being used: alarm/current')
		}
	} else {
		log('Stopping: You have not setup your Alarm Topics in your config.json')
		return; // Error
	}
	// Alarm Settings
	if (config.alarmSettings) {
		this.alarmSettings = config.alarmSettings
		if (config.alarmSettings.targetStates) {
			// Target States
			this.targetStates = config.alarmSettings.targetStates
			if (!config.alarmSettings.targetStates.stayArm) {
				this.alarmSettings.targetStates.stayArm = false
			}
			if (!config.alarmSettings.targetStates.awayArm) {
				this.alarmSettings.targetStates.awayArm = false
			}
			if (!config.alarmSettings.targetStates.nightArm) {
				this.alarmSettings.targetStates.nightyArm = false
			}
		} else {
			log('Stopping: You have not setup your Target States under Alarm Settings in your config.json')
			return; // Error
		}
	} else {
		log('Stopping: You have not setup your Alarm Settings in your config.json')
		return; // Error
	}
	// Keyfob Enabled / Disabled
	if (config.sensor) {
		this.sensor = config.sensor // All Sensors Object
	} else {
		log('Stopping: You have not setup your Sensors in your config.json')
		return; // Error
	}
	if (config.keyfob) {
		this.keyfob = config.keyfob
	} else {
		this.keyfob = false
	}
	if (this.keyfob) {
		if (config.keyfobs) {
			this.keyfobs = config.keyfobs // Keyfob object
			if (config.keyfobs.buttons) {
				this.buttons = config.keyfobs.buttons // Button object
			}
		}
	}
	if (config.siren) {
		this.siren = config.siren // Siren object
	} else {
		this.siren.enabled = false
	}
	// Keyfob
	if (this.keyfob === true) {
		log("Setup: Keyfob available")
		// Siren
		if (this.siren.enabled === true) {
			log("Setup: Siren Enabled")
		} else {
			log("Setup: Siren Disabled")
		};
	} else {
		log("Setup: No Keyfob available")
	};
	
	// Set initial state to disarmed
	log('Setup: Setting initial HomeKit state to disarmed');
	this.readstate = Characteristic.SecuritySystemCurrentState.DISARMED;

	// Set 'that' to 'this' to be able to access global 'this' inside 'this'
	var that = this

	// MQTT Message Received
	this.client.on('message', function (topic, msg) {
		var message = msg.toString();
		// Set HomeKit Alarm based on Keyfob Button presses
		if (that.keyfob === true && topic === that.alarmTopics.messageTopic) {
			for (let keyfob in that.keyfobs) {
				if (that.keyfobs[keyfob].enabled === true) {
					for (let button in that.keyfobs[keyfob].buttons) {
						if (that.keyfobs[keyfob].buttons[button].enabled === true && message.indexOf(that.keyfobs[keyfob].buttons[button].MQTTCode) !== -1) {
							var stateName = that.keyfobs[keyfob].buttons[button].alarmState
							switch (stateName) {
								case that.commandStayArm:
									stateName = 'STAY_ARM'
									break;
								case that.commandAwayArm:
									stateName = 'AWAY_ARM'
									break;
								case that.commandNightArm:
									stateName = 'NIGHT_ARM'
									break;
								case that.commandDisarmed:
									stateName = 'DISARMED'
									break;
								case that.commandTriggered:
									stateName = 'ALARM_TRIGGERED'
									break;
								default:
									stateName = null;
									break;
							}
							if (that.debug) {
								log("Keyfob Button Pressed:", stateName, "(", that.keyfobs[keyfob].buttons[button].alarmState, ")")
							}
							if (stateName === 'ALARM_TRIGGERED') {
								that.securityService.setCharacteristic(Characteristic.SecuritySystemCurrentState, that.commandTriggered);
								that.client.publish(that.alarmTopics.getCurrentStateTopic, that.stateTriggered);
							}
							if (stateName !== 'ALARM_TRIGGERED') {
								that.securityService.setCharacteristic(Characteristic.SecuritySystemTargetState, that.keyfobs[keyfob].buttons[button].alarmState);
							}
						}
					}

				}
			}
		}
		// Current state or target state topic messages (setting the state)
		if (topic === that.alarmTopics.getCurrentStateTopic || topic === that.alarmTopics.setTargetStateTopic) {
			if (that.debug) {
				log("Topic:", topic)
				log("Message:", message)
			}
			switch (message) {
				case that.stateStayArm:
					message = Characteristic.SecuritySystemCurrentState.STAY_ARM; // STAY_ARM = 0
					break;
				case that.stateAwayArm:
					message = Characteristic.SecuritySystemCurrentState.AWAY_ARM; // AWAY_ARM = 1
					break;
				case that.stateNightArm:
					message = Characteristic.SecuritySystemCurrentState.NIGHT_ARM; // NIGHT_ARM = 2
					break;
				case that.stateDisarmed:
					message = Characteristic.SecuritySystemCurrentState.DISARMED; // DISARMED = 3
					break;
				case that.stateDisarm:
					message = Characteristic.SecuritySystemCurrentState.DISARMED; // DISARMED = 3
					break;
				case that.stateTriggered:
					message = Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED; // ALARM_TRIGGERED = 4
					break;
				default:
					message = null;
					break;
			};
			// Set HomeKit state to alarm state
			if (message !== null) {
				that.readstate = message;
				that.securityService.getCharacteristic(Characteristic.SecuritySystemCurrentState, that.readstate);
				// Set Siren State if siren enabled
				if (that.keyfob === true && that.siren.enabled === true) {
					for (let keyfob in that.keyfobs) {
						if (that.keyfobs[keyfob].enabled === true) {
							for (let button in that.keyfobs[keyfob].buttons) {
								if (that.keyfobs[keyfob].buttons[button].enabled === true && that.keyfobs[keyfob].buttons[button].alarmState === that.readstate) {
									// On change of HomeKit switch publish to all RFKey topics for that state (for enabled buttons)
									// This is because HomeKit doesn't know which RFKey or MQTT Code to use 
									that.client.publish(that.keyfobs[keyfob].buttons[button].rfkeyTopic, that.keyfobs[keyfob].buttons[button].MQTTCode);
									if (that.debug) {
										log("MQTT Code", that.keyfobs[keyfob].buttons[button].MQTTCode, "published to", that.keyfobs[keyfob].buttons[button].rfkeyTopic)
									}
								}
							}
						}
					}
					if (that.debug) {
						if (that.readstate === 0 || that.readstate === 1 || that.readstate === 2) { // Armed
							log("Siren Status: Armed")
						}
						if (that.readstate === 3) { // Disarmed
							log("Siren Status: Disarmed")
						}
						if (that.readstate === 4) { // SOS
							log("Siren Status: Triggered")
						}
					}
				}
			};
		}
		// Sensor topic messages (triggered messages)
		if (topic == that.alarmTopics.messageTopic) {
			for (let sensor in that.sensor) {
				// Sensor is in MQTT message

				if (message.indexOf(that.sensor[sensor].MQTTCode) !== -1) {
					// Sensor is enabled and alarm is not Disarmed
					if (that.sensor[sensor].enabled === true && that.readstate != 3) {
						// If sensor is allowed in the enabled state (and alarm is triggered)
						if (that.sensor[sensor].allowStay === true && that.readstate === 0) {
							triggerAlarm.call()
						}
						if (that.sensor[sensor].allowAway === true && that.readstate === 1) {
							triggerAlarm.call()
						}
						if (that.sensor[sensor].allowNight === true && that.readstate === 2) {
							triggerAlarm.call()
						}
						// Trigger Alarm Function
						function triggerAlarm() {
							log('Sensor Triggered:', that.sensor[sensor].location, '(', that.sensor[sensor].MQTTCode, ')')
							// MQTT Publish Triggered 
							that.client.publish(that.alarmTopics.getTargetStateTopic, that.stateTriggered);
							// Trigger Alarm in HomeKit
							that.securityService.setCharacteristic(Characteristic.SecuritySystemCurrentState, that.commandTriggered);
							// Trigger Siren if enabled
							if (that.keyfob === true && that.siren.enabled === true) {
								for (let keyfob in that.keyfobs) {
									if (that.keyfobs[keyfob].enabled === true) {
										for (let button in that.keyfobs[keyfob].buttons) {
											if (that.keyfobs[keyfob].buttons[button].enabled === true && that.keyfobs[keyfob].buttons[button].alarmState === that.commandTriggered) {
												that.client.publish(that.keyfobs[keyfob].buttons[button].rfkeyTopic, that.keyfobs[keyfob].buttons[button].MQTTCode);
											}
										}
									}
								}
								log("Siren Triggered")
							}
						}
					}
				}
			}
		}
	});

	// Subscribe to all topics on connect
	this.client.on('connect', function () {
		for (let topic in that.alarmTopics) {
			that.client.subscribe(that.alarmTopics[topic]);
			if (that.debug) {
				log('Setup: Connected and subscribed to: ', that.alarmTopics[topic]);
			}
		}
		if (that.keyfob === true) {
			for (let keyfob in that.keyfobs) {
				if (that.keyfobs[keyfob].enabled === true) {
					for (let button in that.keyfobs[keyfob].buttons) {
						if (that.keyfobs[keyfob].buttons[button].enabled === true) {
							if (that.keyfobs[keyfob].buttons[button].rfkeyTopic) {
								that.client.subscribe(that.keyfobs[keyfob].buttons[button].rfkeyTopic);
								if (that.debug) {
									log('Setup: Connected and subscribed to RFKey topic: ', that.keyfobs[keyfob].buttons[button].rfkeyTopic);
								}
							} else {
								log('Stopping: Button RFKey Topic has not been provided in config.json')
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
		switch (state) {
			case Characteristic.SecuritySystemTargetState.STAY_ARM:
				mqttstate = this.stateStayArm;
				break;
			case Characteristic.SecuritySystemTargetState.AWAY_ARM:
				mqttstate = this.stateAwayArm;
				break;
			case Characteristic.SecuritySystemTargetState.NIGHT_ARM:
				mqttstate = this.stateNightArm;
				break;
			case Characteristic.SecuritySystemTargetState.DISARMED:
				mqttstate = this.stateDisarmed;
				break;
			case Characteristic.SecuritySystemTargetState.DISARM:
				mqttstate = this.stateDisarm;
				break;
		};
		// MQTT Publish State 
		this.client.publish(this.alarmTopics.getCurrentStateTopic, mqttstate, {
			qos: 0,
			retain: true
		});
		this.log("Setting state to:", mqttstate)
		this.securityService.setCharacteristic(Characteristic.SecuritySystemCurrentState, state);
		callback(null, state);
	},

	getState: function (callback) {
		if (this.readstate == "0" || this.readstate == "1" || this.readstate == "2" || this.readstate == "3" || this.readstate == "4") {
			if (this.debug) {
				this.log("Setting state to:", this.readstate);
			}
			callback(null, this.readstate);
		} else {
			this.log(this.readstate, " is not a valid HomeKit State. It should be one of: 0, 1, 2, 3, 4");
			callback("error");
		};
	},

	getCurrentState: function (callback) {
		if (this.debug) {
			this.log("Getting current state")
		}
		this.getState(callback);
	},

	getTargetState: function (callback) {
		if (this.debug) {
			this.log("Getting target state")
		}
		this.getState(callback);
	},

	identify: function (callback) {
		this.log("Identify requested!");
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
		var allowedTargetStates = [3] // Always have disarmed
		for (var state in this.targetStates) {
			if (this.targetStates[state] === true) {
				if (state == "stayArm") {
					state = 0
					allowedTargetStates.push(state)
				}
				if (state == "awayArm") {
					state = 1
					allowedTargetStates.push(state)
				}
				if (state == "nightArm") {
					state = 2
					allowedTargetStates.push(state)
				}
				let characteristic = this.securityService.getCharacteristic(Characteristic.SecuritySystemTargetState);
				characteristic.props.validValues = allowedTargetStates; // (needs to be a number array e.g. [0,1,2,3])
			}
		}
		this.securityService
			.getCharacteristic(Characteristic.SecuritySystemTargetState)
			.on('get', this.getTargetState.bind(this))
			.on('set', this.setTargetState.bind(this));

		return [informationService, this.securityService];
	}
};