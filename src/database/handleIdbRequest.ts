export default function handleIdbRequest(req: IDBRequest) {
  return new Promise((resolve, reject) => {
    req.onsuccess = (res: any) => resolve(res.target.result)
    req.onerror = (e: any) => reject(e.target.error)
  })
}
