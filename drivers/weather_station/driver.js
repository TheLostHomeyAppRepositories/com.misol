'use strict';

const { Driver } = require('homey');

class WeatherStationDriver extends Driver
{
    /**
     * onInit is called when the driver is initialized.
     */
    async onInit()
    {
        this.log('WeatherStationDriver has been initialized');
    }

    /**
     * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
     * This should return an array with the data of devices that are available for pairing.
     */
    async onPairListDevices()
    {
        var devices = [];
        for (const gateway of this.homey.app.detectedGateways)
        {
            if ((gateway.winddir !== undefined) && (gateway.wh80batt === undefined))
            {
                const meter = { name: "Weather Station", data: { id: gateway.PASSKEY, PASSKEY: gateway.PASSKEY, meterNumber: 0 } };
				if (gateway.rrain_piezo)
				{
					meter.icon = '/ws90s.svg';
				}
                devices.push(meter);
            }
        }

        return devices;
    }
}

module.exports = WeatherStationDriver;