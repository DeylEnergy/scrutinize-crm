import {useLocalStorage} from './index'

const VIDEO_DEVICE_LABEL_KEY = 'VIDEO_DEVICE_LABEL'

export default function useVideoDeviceLabel() {
  return useLocalStorage(VIDEO_DEVICE_LABEL_KEY, undefined)
}
