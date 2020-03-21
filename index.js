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
	this.payloadStayArm = 'Stay Arm (Home)';
	this.payloadAwayArm = 'Away Arm';
	this.payloadNightArm = 'Night Arm';
	this.payloadDisarmed = 'Disarmed';
	this.payloadDisarm = 'Disarm';
	this.payloadTriggered = 'Triggered';

	// Set initial state to disarmed
	log("Setting initial HomeKit state to disarmed");
	this.readstate = Characteristic.SecuritySystemCurrentState.DISARMED;

	// Load data from config.json
	this.debug = config.debug; // Extra logging
	this.name = config.name // Name of sensor in Homekit (Defaults to 'Homeqtt')
	this.sensors = config.sensors // All Sensors Object
	this.targetStates = config.alarmSettings.targetStates // Target States
	this.keyfob = config.keyfob // Keyfob
	this.siren = config.keyfob.siren // Siren Object

	// Keyfob
	if (this.keyfob.keyfobEnabled === true) {
		log("Keyfob available") 
	} else {
		log("No Keyfob available") 
	};
	// Siren
	if (this.keyfob.sirenEnabled === true) {
		log("Siren Enabled") 
	} else {
		log("Siren Disabled") 
	};
	// MQTT Topics
	this.alarmTopics = config.alarmTopics // All Topics

	// MQTT Broker connection settings
	var mqttClientId = config.name.replace(/[^\x20-\x7F]/g, "") + '_' + Math.random().toString(16).substr(2, 8);
	var mqttBroker = config.mqttOptions.url // MQTT Broker URL and Port
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
		username: config.username,
		password: config.password,
		rejectUnauthorized: false
	};
	// Show MQTT Options in log
	if (this.debug) {
		log('MQTT Broker: ' + mqttBroker);
		log('MQTT Options: ' + JSON.stringify(options, function (key, value) {
			if (key == "password") {
				return undefined; // filter out
			}
			return value;
		}));
	}
	// Connect to MQTT
	this.client = mqtt.connect(mqttBroker, options);
	// MQTT Connection Error
	this.client.on('error', function () {
		log('Error event on MQTT');
	});

	// Set 'that' to 'this' to be able to access global 'this' inside 'this'
	var that = this

	// MQTT Message Received
	this.client.on('message', function (topic, msg) {
		var message = msg.toString();
		// Set Homekit Alarm based on Keyfob Button presses
		if (that.keyfob.keyfobEnabled === true) {
			if (topic == that.alarmTopics.sensorTopic) {
				if (message.indexOf(that.keyfob.keyfobMQTTCodes.keyfobAwayArmCode) !== -1){
					if (that.debug) {
						log("Keyfob Button Pressed: Away Arm")
					}
					var message = that.payloadAwayArm
					that.securityService.setCharacteristic(Characteristic.SecuritySystemTargetState, 1);
					that.client.publish(that.alarmTopics.getCurrentStateTopic, that.payloadAwayArm);
				}
				if (message.indexOf(that.keyfob.keyfobMQTTCodes.keyfobStayArmCode) !== -1){
					if (that.debug) {
						log("Keyfob Button Pressed: Stay Arm")
					}
					var message = that.payloadStayArm
					that.securityService.setCharacteristic(Characteristic.SecuritySystemTargetState, 0);
					that.client.publish(that.alarmTopics.getCurrentStateTopic, that.payloadStayArm);
				}
				if (message.indexOf(that.keyfob.keyfobMQTTCodes.keyfobDisarmCode) !== -1){
					if (that.debug) {
						log("Keyfob Button Pressed: Disarmed")
					}
					var message = that.payloadDisarmed
					that.securityService.setCharacteristic(Characteristic.SecuritySystemTargetState, 3);
					that.client.publish(that.alarmTopics.getCurrentStateTopic, that.payloadDisarmed);
				}
				if (message.indexOf(that.keyfob.keyfobMQTTCodes.keyfobSOSCode) !== -1){
					log("Keyfob SOS Triggered")
					var message = that.payloadTriggered
					that.securityService.setCharacteristic(Characteristic.SecuritySystemCurrentState, 4);
					that.client.publish(that.alarmTopics.getCurrentStateTopic, that.payloadTriggered);
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
				case that.payloadStayArm:
					message = Characteristic.SecuritySystemCurrentState.STAY_ARM; // STAY_ARM = 0
					break;
				case that.payloadAwayArm:
					message = Characteristic.SecuritySystemCurrentState.AWAY_ARM; // AWAY_ARM = 1
					break;
				case that.payloadNightArm:
					message = Characteristic.SecuritySystemCurrentState.NIGHT_ARM; // NIGHT_ARM = 2
					break;
				case that.payloadDisarmed:
					message = Characteristic.SecuritySystemCurrentState.DISARMED; // DISARMED = 3
					break;
				case that.payloadDisarm:
					message = Characteristic.SecuritySystemCurrentState.DISARMED; // DISARM = 3
					break;
				case that.payloadTriggered:
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
				if (that.keyfob.sirenEnabled === true) {
					if (that.readstate === 0 || that.readstate === 1 || that.readstate === 2) {
						that.client.publish(that.keyfob.keyfobTopics.keyfobAwayArmTopic, that.keyfob.keyfobMQTTCodes.keyfobAwayArmCode);
						if (that.debug) {
							log("Siren Status: Armed")
						}
					}
					if (that.readstate === 3) {
						that.client.publish(that.keyfob.keyfobTopics.keyfobDisarmTopic, that.keyfob.keyfobMQTTCodes.keyfobDisarmCode);
						if (that.debug) {
							log("Siren Status: Disarmed")
						}
					}
					if (that.readstate === 4) {
						that.client.publish(that.keyfob.keyfobTopics.keyfobSOSTopic, that.keyfob.keyfobMQTTCodes.keyfobSOSCode);
						if (that.debug) {
							log("Siren Status: Triggered")
						}
					}
				}
			};
		}
		// Sensor topic messages (triggered messages)
		if (topic == that.alarmTopics.sensorTopic) {
			for (let sensor in that.sensors) {
				// Sensor is in MQTT message
				if (message.indexOf(that.sensors[sensor].sensorMQTTCode) !== -1) {
					// Sensor is enabled and alarm is not Disarmed
					if (that.sensors[sensor].sensorEnabled === true && that.readstate != 3) {
						// If sensor is allowed in the enabled state (and alarm is triggered)
						if (that.sensors[sensor].sensorAllowStay === true && that.readstate === 0) {
							triggerAlarm.call()
						}
						if (that.sensors[sensor].sensorAllowAway === true && that.readstate === 1) {
							triggerAlarm.call()
						}
						if (that.sensors[sensor].sensorAllowNight === true && that.readstate === 2) {
							triggerAlarm.call()
						}
						// Trigger Alarm Function
						function triggerAlarm() {
								log('Sensor Triggered:', that.sensors[sensor].sensorLocation, '(', that.sensors[sensor].sensorMQTTCode, ')')
							// MQTT Publish Triggered 
							that.client.publish(that.alarmTopics.getCurrentStateTopic, that.payloadTriggered);
							// Trigger Alarm in HomeKit
							that.securityService.setCharacteristic(Characteristic.SecuritySystemCurrentState, 4);
							// Trigger Siren if enabled
							if (that.keyfob.sirenEnabled === true) {
								that.client.publish(that.keyfob.keyfobTopics.keyfobSOSTopic, that.keyfob.keyfobMQTTCodes.keyfobSOSCode);
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
				log('Connected and subscribed to: ', that.alarmTopics[topic]);
			}
		}
		if (that.keyfob.keyfobEnabled === true) {
			for (let keyfobTopic in that.keyfob.keyfobTopics) {
				that.client.subscribe(that.keyfob.keyfobTopics[keyfobTopic]);
				if (that.debug) {
					log('Connected and subscribed to keyfob topic: ', that.keyfob.keyfobTopics[keyfobTopic]);
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
				mqttstate = this.payloadStayArm;
				break;
			case Characteristic.SecuritySystemTargetState.AWAY_ARM:
				mqttstate = this.payloadAwayArm;
				break;
			case Characteristic.SecuritySystemTargetState.NIGHT_ARM:
				mqttstate = this.payloadNightArm;
				break;
			case Characteristic.SecuritySystemTargetState.DISARMED:
				mqttstate = this.payloadDisarmed;
				break;
			case Characteristic.SecuritySystemTargetState.DISARM:
				mqttstate = this.payloadDisarm;
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