'use strict';

const Homey = require('homey');

module.exports = class MyDriver extends Homey.Driver
{

	/**
	 * onInit is called when the driver is initialized.
	 */
	async onInit()
	{
		this.log('MyDriver has been initialized');
	}

	/**
	 * onPairListDevices is called when a user is adding a device
	 * and the 'list_devices' view is called.
	 * This should return an array with the data of devices that are available for pairing.
	 */
	async onPairListDevices()
	{
		const devices = await this.homey.app.getIOTDeviceList();

		// Extract each device object from the command arrays that have "model": 1
		const filteredDevices = devices
			.flatMap(deviceGroup => deviceGroup.command || [])
			.filter(device => device.model === 1);

		// return an array of devices that has { name: `WittFlow : ${device.id}`, data: { id: device.id }, settings: { address: device.gatewayIP } };
		return filteredDevices.map(device => ({
			name: `WittFlow : ${device.id}`,
			data: { id: device.id },
			settings: { address: device.gatewayIP }
		}));
	}

	async onRepair(session, device)
	{
		// Argument session is a PairSocket, similar to Driver.onPair
		// Argument device is a Homey.Device that's being repaired
		session.setHandler('showView', async (viewId) =>
		{
			if (viewId === 'loading')
			{
				const devices = await this.homey.app.getIOTDeviceList();
				let deviceID = device.getData().id;

				// Find the device in the list of devices
				const foundDevice = devices
					.flatMap(deviceGroup => deviceGroup.command || [])
					.find(device => device.id === deviceID);

				if (foundDevice)
				{
					// If the device is found, update its settings with the new gateway IP
					await device.setSettings({ address: foundDevice.gatewayIP });
				}
				else
				{
					// If the device is not found, throw an error to indicate repair failure
					throw new Error(`Device with ID ${deviceID} not found during repair.`);
				}

				// 3. This MUST be called to trigger the "Success" state and auto-close
				await session.done();
			}
		});
	}

};
