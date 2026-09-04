import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import type {
  Application,
  ApplicationInput,
  ApplicationUpdateInput,
} from '../types'
import { useAuth } from './AuthContext'

interface ApplicationsContextValue {
  applications: Application[]
  loading: boolean
  error: string
  refresh: () => Promise<void>
  createApplication: (input: ApplicationInput) => Promise<string>
  updateApplication: (id: string, input: ApplicationInput) => Promise<void>
  deleteApplication: (id: string) => Promise<void>
  addUpdate: (
    applicationId: string,
    input: ApplicationUpdateInput,
    syncStatus?: boolean,
  ) => Promise<void>
  editUpdate: (
    updateId: string,
    applicationId: string,
    input: ApplicationUpdateInput,
    syncStatus?: boolean,
  ) => Promise<void>
  deleteUpdate: (updateId: string) => Promise<void>
  importApplications: (items: ApplicationInput[]) => Promise<number>
  loadDemoData: () => Promise<void>
  clearDemoData: () => Promise<void>
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null)

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!supabase || !user) {
      setApplications([])
      setLoading(false)
      return
    }

    const { data, error: queryError } = await supabase
      .from('applications')
      .select('*, application_updates(*)')
      .order('application_date', { ascending: false })

    if (queryError) {
      setError(queryError.message)
      setLoading(false)
      return
    }

    setApplications((data ?? []) as Application[])
    setError('')
    setLoading(false)
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const ensureClient = useCallback(() => {
    if (!supabase || !user) throw new Error('You must be signed in.')
    return { client: supabase, userId: user.id }
  }, [user])

  const value = useMemo<ApplicationsContextValue>(
    () => ({
      applications,
      loading,
      error,
      refresh,
      createApplication: async (input) => {
        const { client, userId } = ensureClient()
        const { data, error: insertError } = await client
          .from('applications')
          .insert({ ...input, user_id: userId })
          .select('id')
          .single()
        if (insertError) throw insertError
        await refresh()
        return data.id as string
      },
      updateApplication: async (id, input) => {
        const { client } = ensureClient()
        const { error: updateError } = await client
          .from('applications')
          .update(input)
          .eq('id', id)
        if (updateError) throw updateError
        await refresh()
      },
      deleteApplication: async (id) => {
        const { client } = ensureClient()
        const { error: deleteError } = await client.from('applications').delete().eq('id', id)
        if (deleteError) throw deleteError
        await refresh()
      },
      addUpdate: async (applicationId, input, syncStatus = true) => {
        const { client } = ensureClient()
        const { error: insertError } = await client
          .from('application_updates')
          .insert({ ...input, application_id: applicationId })
        if (insertError) throw insertError
        if (syncStatus) {
          const { error: statusError } = await client
            .from('applications')
            .update({ status: input.status })
            .eq('id', applicationId)
          if (statusError) throw statusError
        }
        await refresh()
      },
      editUpdate: async (updateId, applicationId, input, syncStatus = true) => {
        const { client } = ensureClient()
        const { error: updateError } = await client
          .from('application_updates')
          .update(input)
          .eq('id', updateId)
        if (updateError) throw updateError
        if (syncStatus) {
          const { error: statusError } = await client
            .from('applications')
            .update({ status: input.status })
            .eq('id', applicationId)
          if (statusError) throw statusError
        }
        await refresh()
      },
      deleteUpdate: async (updateId) => {
        const { client } = ensureClient()
        const { error: deleteError } = await client
          .from('application_updates')
          .delete()
          .eq('id', updateId)
        if (deleteError) throw deleteError
        await refresh()
      },
      importApplications: async (items) => {
        const { client, userId } = ensureClient()
        let imported = 0
        for (let index = 0; index < items.length; index += 100) {
          const batch = items.slice(index, index + 100).map((item) => ({
            ...item,
            user_id: userId,
          }))
          const { error: importError } = await client.from('applications').insert(batch)
          if (importError) throw importError
          imported += batch.length
        }
        await refresh()
        return imported
      },
      loadDemoData: async () => {
        const { client } = ensureClient()
        const { error: rpcError } = await client.rpc('seed_demo_applications')
        if (rpcError) throw rpcError
        await refresh()
      },
      clearDemoData: async () => {
        const { client } = ensureClient()
        const { error: rpcError } = await client.rpc('clear_demo_applications')
        if (rpcError) throw rpcError
        await refresh()
      },
    }),
    [applications, ensureClient, error, loading, refresh],
  )

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>
}

export function useApplications() {
  const context = useContext(ApplicationsContext)
  if (!context) {
    throw new Error('useApplications must be used within ApplicationsProvider')
  }
  return context
}
