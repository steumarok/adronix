export type IDataBroker = {
  get(url: string): Promise<Response>
  post(url: string, data: any): Promise<Response>
}

export function useFetch(): IDataBroker {
  return {
    get: (url) => fetch(url),
    post: (url, data) => {
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
      })
    }
  }
}
