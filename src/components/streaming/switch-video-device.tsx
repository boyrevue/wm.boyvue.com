import { Select } from 'antd';
import { useLocalTrack, useVideoDevice, useWebRTCAdapter } from 'src/antmedia';

export default function SwitchVideoDevice() {
  const devices = useVideoDevice();
  const webRTCAdaptor = useWebRTCAdapter();
  const track = useLocalTrack();

  const handleChange = (deviceId: string) => {
    if (webRTCAdaptor && track) webRTCAdaptor.switchVideoCameraCapture(track, deviceId);
  };

  if (!devices.length) return null;

  return (
    <Select style={{ width: '100%' }} onChange={handleChange} placeholder="Select Video Source">
      {devices.map((device) => (
        <Select.Option
          key={device.deviceId}
          value={device.deviceId}
        >
          {device.label}
        </Select.Option>
      ))}
    </Select>
  );
}
