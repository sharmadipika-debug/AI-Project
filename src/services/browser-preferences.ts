const changeEvent = 'morrow:preferences-change'

function notifyChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(changeEvent))
}

export function subscribeToPreferences(onChange: () => void) {
  if (typeof window === 'undefined') return () => undefined
  window.addEventListener('storage', onChange)
  window.addEventListener(changeEvent, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(changeEvent, onChange)
  }
}

export function getSavedRoutesSnapshot() {
  return typeof window === 'undefined' ? '[]' : localStorage.getItem('morrow:saved-routes') ?? '[]'
}

export function getPreferredAmountSnapshot() {
  return typeof window === 'undefined' ? '1000' : localStorage.getItem('morrow:preferred-amount') ?? '1000'
}

export function readSavedRoutes(snapshot: string) {
  try {
    const value: unknown = JSON.parse(snapshot)
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function saveRoutePreferences(routes: string[]) {
  localStorage.setItem('morrow:saved-routes', JSON.stringify(routes))
  notifyChange()
}

export function savePreferredAmount(amount: string) {
  localStorage.setItem('morrow:preferred-amount', amount)
  notifyChange()
}