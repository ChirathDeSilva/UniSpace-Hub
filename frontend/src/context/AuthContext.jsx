import { useMemo, useState } from 'react'
import { clearTokens, getAccessToken, setTokens } from '../services/authStorage'
import AuthContext from './authContextInstance'

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => getAccessToken())

  const value = useMemo(() => {
    const isAuthenticated = Boolean(accessToken)

    return {
      accessToken,
      isAuthenticated,
      signIn: ({ accessToken: newAccessToken, refreshToken }) => {
        setTokens({ accessToken: newAccessToken, refreshToken })
        setAccessToken(newAccessToken)
      },
      signOut: () => {
        clearTokens()
        setAccessToken(null)
      },
    }
  }, [accessToken])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
