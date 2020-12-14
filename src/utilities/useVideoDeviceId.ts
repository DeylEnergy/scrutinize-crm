import {useLocalStorage} from './index'

const VIDEO_DEVICE_ID_KEY = 'VIDEO_DEVICE_ID'

export default function useVideoDeviceId() {
  return useLocalStorage(VIDEO_DEVICE_ID_KEY, undefined)
}
