import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { notificationsAPI } from '../api/notifications'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      return
    }
    try {
      const res = await notificationsAPI.getUnreadCount()
      setUnreadCount(res.data.unread_count || res.data.count || 0)
    } catch (err) {
      console.warn('Unread count fetch notice:', err)
    }
  }, [isAuthenticated])

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const res = await notificationsAPI.getNotifications()
      setNotifications(res.data.results || res.data || [])
    } catch (err) {
      console.warn('Notifications fetch notice:', err)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error(err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        isOpen,
        setIsOpen,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
