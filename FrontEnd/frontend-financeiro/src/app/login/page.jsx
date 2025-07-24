'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaChartLine, FaEye, FaEyeSlash } from 'react-icons/fa'

export default function LoginPage() {
  const [username, setUsername]       = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]             = useState('')
  const router                        = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Credenciais inválidas.')
      }

      const { token } = await res.json()
      // ALTERADO: de localStorage para sessionStorage
      sessionStorage.setItem('authToken', token)

      router.push('/resumo')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          className="flex items-center justify-center mb-6 space-x-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <FaChartLine className="w-8 h-8 text-orange-400" />
          <span className="text-2xl font-bold text-white">IJJ FIDC</span>
        </motion.div>

        <h2 className="text-center text-2xl font-semibold text-orange-400 mb-8">
          Bem-vindo de volta
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <label className="block text-gray-300 mb-1">Usuário ou E-mail</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              placeholder="Digite seu usuário ou email"
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
          </motion.div>

          <motion.div
            className="relative"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <label className="block text-gray-300 mb-1">Senha</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="********"
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute inset-y-11 right-3 flex items-center justify-center text-gray-400 focus:outline-none"
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </motion.div>

          {error && (
            <motion.p
              className="text-center text-red-500 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            className="w-full py-2 border-2 border-orange-500 text-orange-500 rounded-full font-semibold
                       shadow-lg transition-transform transform hover:scale-105 hover:bg-orange-500 hover:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            whileTap={{ scale: 0.98 }}
          >
            Entrar
          </motion.button>
        </form>
      </motion.div>
    </main>
  )
}