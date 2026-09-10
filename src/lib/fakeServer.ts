import { useSyncExternalStore } from 'react'

/**
 * Một "server giả" có thể chỉnh độ trễ và bắt lỗi ngay trên UI.
 * Mục đích: khi present có thể kéo latency lên 3 giây để mọi người
 * nhìn rõ trạng thái optimistic, hoặc bật "luôn lỗi" để xem UI tự rollback.
 */

export type FailMode = 'never' | 'random' | 'always'

export type ServerConfig = {
  /** Độ trễ giả lập (ms) */
  latency: number
  failMode: FailMode
}

let config: ServerConfig = { latency: 1200, failMode: 'never' }

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export function setServerConfig(patch: Partial<ServerConfig>) {
  config = { ...config, ...patch }
  emit()
}

export function getServerConfig(): ServerConfig {
  return config
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Đọc cấu hình server trong component (tự re-render khi đổi) */
export function useServerConfig(): ServerConfig {
  return useSyncExternalStore(subscribe, getServerConfig, getServerConfig)
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export class ServerError extends Error {
  constructor(message = 'Server từ chối yêu cầu (500)') {
    super(message)
    this.name = 'ServerError'
  }
}

function shouldFail() {
  if (config.failMode === 'always') return true
  if (config.failMode === 'random') return Math.random() < 0.5
  return false
}

/**
 * Giả lập một lần gọi API: chờ theo latency rồi trả về dữ liệu — hoặc ném lỗi.
 */
export async function fakeRequest<T>(data: T, opts?: { latency?: number }): Promise<T> {
  await sleep(opts?.latency ?? config.latency)
  if (shouldFail()) {
    throw new ServerError()
  }
  return data
}

let idSeed = 100
export function nextId(prefix = 'id') {
  idSeed += 1
  return `${prefix}-${idSeed}`
}

export function nowTime() {
  return new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
