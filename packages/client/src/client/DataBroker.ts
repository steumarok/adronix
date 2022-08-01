let dataAuthToken: string | null = null
let responseHandler: (response: Response) => void

export function setDataAuthToken(authToken: string) {
  dataAuthToken = authToken
}

export type IDataBroker = {
  get(url: string): Promise<Response>
  post(url: string, data: any): Promise<Response>
}

export function useFetch(): IDataBroker {

  function getHeaders() {
    const headers = {} as any
    if (dataAuthToken) {
      headers['Authorization'] = `Bearer ${dataAuthToken}`
    }
    return headers
  }

  return {
    get: async (url) => {
      const params: any = {
        method: 'GET',
        headers: getHeaders()
      }
      const resp = await fetch(url, params)
      if (responseHandler) {
        responseHandler(resp)
      }
      return resp
    },
    post: async (url, data) => {
      const headers = getHeaders()
      const params: any = {
        method: 'POST',
        body: data instanceof FormData
          ? data
          : JSON.stringify(data)
      }
      if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json;charset=utf-8'
      }
      params['headers'] = headers
      const resp = await fetch(url, params)
      if (responseHandler) {
        responseHandler(resp)
      }
      return resp
    }
  }
}

export function setResponseHandler(handler: (response: Response) => void) {
  responseHandler = handler
}