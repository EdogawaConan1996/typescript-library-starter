import { encode, isDate, isPlainObject, normalizeHeaderName } from './tools'
import { AxiosResponse } from '../types'

/**
 * the process of url according the request url and the params
 * @param url
 * @param params
 */
export function buildURL(url: string, params?: any): string {
  if (!params) {
    return url
  }

  const parts: Array<string> = [];

  Object.keys(params).forEach((key) => {
    const val = params[key]
    if (val === null || typeof val === 'undefined') {
      return   // 跳到下一层循环
    }
    let values = []
    if (Array.isArray(val)) {
      values = val
      key += '[]'
    } else {
      values = [val]
    }

    values.forEach((val) => {
      if (isDate(val)) {
        val = val.toISOString()
      } else if (isPlainObject(val)) {
        val = JSON.stringify(val)
      }
      parts.push(`${key}=${encode((val))}`)
    })
  })

  let serializedParams = parts.join('&')

  if (serializedParams) {
    const markIndex = url.indexOf('#')
    if (markIndex !== -1) {
      url = url.slice(0, markIndex)
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }

  return url;
}

/**
 * the process of request body
 * if the request body is the type of plain object, transform this to the type of string
 * @param data
 */
export function transformRequest (data: any): any {
  console.log(isPlainObject(data))
  if (isPlainObject(data)) {
    return JSON.stringify(data)
  }
  return data
}

/**
 * the process of request headers
 * @param headers
 * @param data
 */
export function processHeaders(headers:any, data: any): any {
  normalizeHeaderName(headers, 'Content-Type')
  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }

  return headers
}

/**
 * parsed the response headers
 * @param headers
 */
export function parseHeaders(headers: string): any {
  let parsed = Object.create(null)
  if (!headers) {
    return parsed
  }

  headers.split('\r\n').forEach((line) =>{
    let [key,val] = line.split(':')
    key = key.trim().toLowerCase()
    if (!key) {
      return
    }
    if (val) {
      val = val.trim()
    }
    parsed[key] = val
  })

  return parsed
}

/**
 * transform the json string to Object
 * @param data
 */
export function transformResponse(data: any): any {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (err) {
      console.log(err)
    }
  }
  return data
}
