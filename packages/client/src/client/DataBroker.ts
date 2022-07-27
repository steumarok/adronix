export type IDataBroker = {
  get(url: string): Promise<Response>
  post(url: string, data: any): Promise<Response>
}

let _accessToken: string | null = null
let _refreshToken: string | null = null

export function useFetch(): IDataBroker {

  function getHeaders() {
    const headers = {} as any
    if (_accessToken) {
      headers['Authorization'] = `Bearer ${_accessToken}`
    }
    return headers
  }

  return {
    get: async (url) => {
      const params: any = {
        method: 'GET',
        headers: getHeaders()
      }
      return fetch(url, params)
    },
    post: (url, data) => {
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
      return fetch(url, params)
    }
  }
}

export function setAuthTokens(accessToken: string, refreshToken: string | null = null) {
  _accessToken = accessToken
  _refreshToken = refreshToken
}
