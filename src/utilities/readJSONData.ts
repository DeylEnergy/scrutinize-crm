export default function readJSONData(file: any) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.readAsText(file)
    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      if (!e.target) {
        return reject('Cannot read content of the file.')
      }

      try {
        const readString = e.target.result as string
        const obj = JSON.parse(readString)
        return resolve(obj)
      } catch {
        reject('File read error. Wrong format.')
      }
    }
  })
}
