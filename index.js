var Service, Characteristic;
var mqtt = require("mqtt");

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
	this.serialNumber = '1.0.6'
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

	// MQTT Topics
	this.topics = config.topics // All Topics
	this.sensorTopic = config.topics.sensorTopic // Topic used to check for sensor activity
	this.setTargetStateTopic = config.topics.setTargetStateTopic // Topic published when the target alarm state is changed in HomeKit
	this.getCurrentStateTopic = config.topics.getCurrentStateTopic // Topic published to notify HomeKit that an alarm state has been achieved

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
		// Current state or target state topic messages (setting the state)
		if (topic === that.getCurrentStateTopic || topic === that.setTargetStateTopic) {
			if (that.debug) {
				log("Topic:", topic)
				log("Message:", message)
			}
			// Convert message state (e.g. Away Arm) to HomekKit integer (e.g. 1)
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
			};
		}
		// Sensor topic messages (triggered messages)
		if (topic == that.sensorTopic) {
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
						// Trigger Alarm
						function triggerAlarm() {
							if (that.debug) {
								log('Sensor Triggered:', that.sensors[sensor].sensorLocation, '(', that.sensors[sensor].sensorMQTTCode, ')')
							}
							// MQTT Publish Triggered 
							that.client.publish(that.topics.getCurrentStateTopic, that.payloadTriggered);
							// Trigger Alarm in HomeKit
							that.securityService.setCharacteristic(Characteristic.SecuritySystemCurrentState, 4);
						}
					}
				}
			}
		}
	});
	// Subscribe to all topics on connect
	this.client.on('connect', function () {
		for (let topic in that.topics) {
			that.client.subscribe(that.topics[topic]);
			if (that.debug) {
				log('Connected and subscribed to: ', that.topics[topic]);
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
			case Characteristic.SecuritySystemTargetState.DISARM:
				mqttstate = this.payloadDisarmed;
				break;
		};
		// MQTT Publish State 
		this.client.publish(this.topics.getCurrentStateTopic, mqttstate, {
			qos: 0,
			retain: true
		});
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
		informationService.setCharacteristic(Characteristic.SerialNumber, this.serialNumber);

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