export default function downloadObjectAsJSON(
  exportObj: any,
  exportName: string,
) {
  const dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(
      typeof exportObj === 'string' ? exportObj : JSON.stringify(exportObj),
    )
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute('href', dataStr)
  downloadAnchorNode.setAttribute('download', exportName + '.json')
  document.body.appendChild(downloadAnchorNode) // required for firefox
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}
