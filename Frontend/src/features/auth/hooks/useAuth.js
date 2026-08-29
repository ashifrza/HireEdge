import { useCallback, useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, verifyOtp, googleAuth } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (error) {
            setUser(null)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const handleOtpVerification = useCallback(async (payload) => {
        const data = await verifyOtp(payload)
        setUser(data.user)
        return data
    }, [setUser])

    const handleGoogleAuth = useCallback(async (credential) => {
        const data = await googleAuth(credential)
        setUser(data.user)
        return data
    }, [setUser])

    return { user, loading, handleRegister, handleLogin, handleLogout, handleOtpVerification, handleGoogleAuth }
}
