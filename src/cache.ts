import fs from 'node:fs'
import os from 'node:os'

export const cacheFilePath = `${os.tmpdir()}/__CUS_CACHE__`

type ConfigCacheItem = [src: string, bak: string]
export type ConfigCache = {
  builtin: ConfigCacheItem[]
  extension: ConfigCacheItem[]
}

let _cache: ConfigCache = {
  builtin: [],
  extension: [],
}
export function addBuiltinConfigCache(src: string, bak: string) {
  _cache.builtin.push([src, bak])
}

export function addExtensionConfigCache(src: string, bak: string) {
  _cache.extension.push([src, bak])
}

export function flushCache() {
  const data = JSON.stringify(_cache, null, 2)
  fs.writeFileSync(cacheFilePath, data, 'utf-8')
}
