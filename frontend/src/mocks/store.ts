import type { AppStore } from '@/types'
import { createSeed } from './seed'

const KEY = 'hospital_mvp_store_v1'

export function loadStore(): AppStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as AppStore
  } catch {
    /* ignore corrupt cache */
  }
  const seed = createSeed()
  saveStore(seed)
  return seed
}

export function saveStore(store: AppStore) {
  localStorage.setItem(KEY, JSON.stringify(store))
}

export function resetStore(): AppStore {
  const seed = createSeed()
  saveStore(seed)
  return seed
}

export function updateStore(mutator: (draft: AppStore) => void): AppStore {
  const store = loadStore()
  mutator(store)
  saveStore(store)
  return store
}
