import Link from 'next/link'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="rounded-xl bg-white p-8 shadow-sm border" style={{ borderColor: '#e5ddd0' }}>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold" style={{ color: '#1c1917' }}>Добро пожаловать</h1>
        <p className="mt-1 text-sm" style={{ color: '#78716c' }}>Войдите в свой аккаунт</p>
      </div>
      <LoginForm />
      <p className="mt-4 text-center text-sm" style={{ color: '#78716c' }}>
        Нет аккаунта?{' '}
        <Link href="/register" className="font-medium underline" style={{ color: '#1c1917' }}>
          Зарегистрироваться
        </Link>
      </p>
    </div>
  )
}
