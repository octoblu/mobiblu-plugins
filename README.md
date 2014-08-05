mobiblu-plugins
===============

[Octoblu](http://octoblu.com) open mobile platform



Writing Plugins for Mobiblu
===========================================

Mobiblu plugins are NPM module bundled with Browserify, which allow you to communicate with Mobiblu's API.

Simple plugins for the [Gateblu](http://github.com/octoblu/gateblu) should work on the mobile as long they have been properly compiled and use browser compatible libraries.

If you wish to contribute, you can submit any plugin that meets the following requirements:

1. Open Source and available on [Github](http://github.com/)
2. Compiled via Browserify
3. Must contain proper package.json and bundle.js files.
3. Utilizes our mobile plugin schema defined below

## Available Dependences

### [Phonegap](http://phonegap.com/) / [AppGyver](http://appgyver.com/) Plugins and APIs

* [Background Geolocation](https://github.com/zgiles/cordova-plugin-background-geolocation)
* [Bluetooth Low Energy](https://github.com/randdusing/BluetoothLE)
* [Geolocation](http://docs.appgyver.com/en/edge/cordova_geolocation_geolocation.md.html)
* [Compass](http://docs.appgyver.com/en/edge/cordova_compass_compass.md.html#Compass)
* [Accelerometer](http://docs.appgyver.com/en/edge/cordova_accelerometer_accelerometer.md.html#Accelerometer)
* [Globalization](http://docs.appgyver.com/en/edge/cordova_globalization_globalization.md.html#Globalization)


### JavaScript Libraries

* **_** - [lodash](http://lodash.com) (utilities library)
* **$** - [jQuery](http://jquery.com) (JavaScript DOM library)
* **Bluebird** - [Bluebird](https://www.npmjs.org/package/bluebird) (JavaScript Promise Library)

## Schema

### Files

**package.json**

This defines the plugin

* **name** must be the name of your plugin. This will be used to bind to the plugin object.
* **version** the version number of your plugin.
* **repository** the public git repo.
* **keywords** a few keywords for discoverability.
* **description** [optional] a description of your plugin.
* **homepage** [optional] the website url for your plugin.
* **author** [optional] the author of the plugin.

**bundle.js**

This file is a [browserify](http://browserify.org/) bundle of an NPM module. This file must be compiled by the plugin owner. It must reside in the root of your repository and named bundle.js.

### Plugin()

Your constructor function will receive a messenger object and a options object. The messenger is used to send and receive messages from Meshblu, and the options object is used to save.

    function Plugin(messenger, options, api, deviceObj){
        this.messenger = messenger;
        this.options = options;
        this.api = api;
        //deviceObj = { uuid : "xxxxx-xxx-xxxxx-xxxxx", "name" : "Device Name from Mobiblu"}
        this.deviceUuid = deviceObj.uuid;
        this.deviceName = deviceObj.name; 

        //continue with initialization of plugin...
    }

#### messenger

The messenger object has a `send()` method that you can use to send messages to other users or devices on Meshblu.

    this.messenger.send({
        devices: 'xxxx---some-uuid---xxx',
        payload: 'hello world.'
    });

You can optionally add a callback if you expect the device you're sending to will give you an immediate response:

    this.messenger.send({
        devices: 'xxxx---some-uuid---xxx',
        payload: 'hello world.'
    }, function(data){
        console.log('response data', data);
    });

Messenger also has a method `data` which allows you to store sensor data on the mobile device in Meshblu. This method will also be sent to the sensor graph on the device screen.

    this.messenger.data({
        device : this.deviceName, // This should be the device name or 
        type : 'temperature', // Should match the sensor data key
        temperature : 79.123 // Should be a number but not required
    });

#### options

Options is an object containing the data that you want to initialize your plugin with when the Mobiblu boots up or first loads an instance of your plugin.

### Events

Your plugin will be confined to those events - all are optional.

* **Plugin.prototype.onMessage()** triggered when mobile device receives a message. [Mobile Specific]
* **Plugin.prototype.onEnable()** triggered the plugin is enabled. [Mobile Specific]
* **Plugin.prototype.onDisable()** triggered the plugin is disabled. [Mobile Specific]
* **Plugin.prototype.onInstall()** triggered the plugin is installed. [Mobile Specific]
* **Plugin.prototype.destroy()** triggered the plugin is uninstalled.

### messageSchema [#Object]

This is an optional json-schema object that describes the type of message you want other devices to send to your plugin.

For example, if you want devices to send an object with a text property to your plugin:

    var messageSchema = {
        type: 'object',
        properties: {
            text: {
                type: 'string',
                required: true
            }
        }
    };

### Options [#Object]

This is an optional json-schema object that describes the type of options you expect to be configured in devices.db.

    var optionsSchema = {
        type: 'object',
        properties: {
            greetingPrefix: {
                type: 'string',
                required: true
            }
        }
    };

### **getDefaultOption ( callback [#Function] )** [#Function]

This is a stand alone function you can optionally export that can give default options to a user that they can use when setting up an instance of a plugin.

Its receives a node style callback function that expects to be called with an error or value.

For example, if you wish to see what serial devices are available to use:

    function getDefaultOptions(callback){
        //do some querying of the connected devices...
        ...
        callback(null, devices);
        ...
        //handle errors:
        callback('A custom error message', null);
    }

### API

Available at on the third parameter passed into Plugin() or `window.octobluMobile.api` you can access a few helper functions for plugins.

#### **api.logActivity( data [#Object] )** [#Function]

This will log the any event into the activity module.

for success messages:

    {
        type : 'GreetingsPlugin',
        html : 'Successful message in text or HTML'
    }

for errors:

    {
        type : 'GreetingsPlugin',
        error : new Error('Error message')
    }

## Example (Greetings Plugin)

**./package.json**

    {
        "name" : "GreetingsPlugin",
        "version" : "0.0.1",
        "description" : "An example plugin for Mobiblu",
        "homepage": "https://octoblu.com/",
        "repository": {
            "type": "git",
            "url": "git://github.com/octoblu/mobile-plugin-greetings.git"
        },
        "keywords": [
            "Octoblu",
            "Greetings"
        ],
        "author": "Octoblu, Inc."
    }



**./bundle.js**

        function Plugin(messenger, options, api, deviceName) {
            this.name = deviceName;

            this.messenger = messenger;
            this.options = options;

            this.api = api; // Mobile Specific

            return this;
        }

        var optionsSchema = {
            type: 'object',
            properties: {
                greetingPrefix: {
                    type: 'string',
                    required: true
                }
            }
        };

        var messageSchema = {
            type: 'object',
            properties: {
                text: {
                    type: 'string',
                    required: true
                }
            }
        };

        Plugin.prototype.onMessage = function (message, fn) {
            var data = message.message || message.payload;
            console.log(this.options.greetingPrefix + ', ' + message.fromUuid);

            var resp = {
                greeting: this.options.greetingPrefix + ' back atcha: ' + data.text
            };

            if (message.fromUuid && fn) {
                resp.withCallback = true;
                fn(resp);
            } else if (message.fromUuid) {
                this.messenger.send({
                    devices: message.fromUuid,
                    payload: resp
                });
            }

        };

        // Mobile Specific
        Plugin.prototype.onEnable = function () {
            this.api.logActivity({
                type: this.deviceName,
                html: 'Greetings plugin enabled'
            });
        };

        // Mobile Specific
        Plugin.prototype.onDisable = function () {
            this.api.logActivity({
                type: this.deviceName,
                html: 'Greetings plugin disabled'
            });
        };

        // Mobile Specific
        Plugin.prototype.onInstall = function () {
            this.api.logActivity({
                type: this.deviceName,
                html: 'Greetings plugin installed'
            });
        };

        Plugin.prototype.destroy = function () {
            //clean up
            this.api.logActivity({
                type: this.deviceName,
                html: 'Destroying plugin installed'
            });

        };


        module.exports = {
            Plugin: Plugin, // Required
            optionsSchema: optionsSchema, // Optional
            messageSchema: messageSchema // Optional
        };

# Examples:

Working plugins for available now.

* [Mobiblu Greetings](https://github.com/octoblu/skynet-mobile-plugin-greeting)
* [Mobiblu Heartbeat](https://github.com/octoblu/skynet-mobile-plugin-heartbeat)
