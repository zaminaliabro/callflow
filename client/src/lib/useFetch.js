import { useCallback, useEffect, useState } from 'react'
import api, { apiError } from '../api/client.js'

// Minimal GET hook: returns { data, loading, error, reload }.
export function useFetch(url, { params, enabled = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const key = JSON.stringify(params || {})

  const reload = useCallback(async () => {
    if (!enabled || !url) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(url, { params })
      setData(res.data)
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, key, enabled])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, loading, error, reload, setData }
}
