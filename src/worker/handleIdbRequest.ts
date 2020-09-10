export default function handleIdbRequest(req: IDBRequest) {
  return new Promise(
    resolve => (req.onsuccess = (res: any) => resolve(res.target.result)),
  )
}
