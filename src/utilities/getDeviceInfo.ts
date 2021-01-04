export default function getDeviceInfo(label: string) {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(devices => {
        const deviceInfo = devices.find(x => x.label.includes(label))
        resolve(deviceInfo)
      })
      .catch(err => {
        reject(err.name + ': ' + err.message)
      })
  })
}
