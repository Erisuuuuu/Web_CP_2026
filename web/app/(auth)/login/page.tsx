import Link from 'next/link'
import LoginForm from './LoginForm'

interface LoginPageProps {
  searchParams: Promise<{ blocked?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { blocked } = await searchParams

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm border" style={{ borderColor: '#e5ddd0' }}>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold" style={{ color: '#1c1917' }}>Добро пожаловать</h1>
        <p className="mt-1 text-sm" style={{ color: '#78716c' }}>Войдите в свой аккаунт</p>
      </div>
      {blocked === '1' && (
        <div className="mb-4 rounded-lg border p-3 text-sm" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}>
          Ваш аккаунт заблокирован администратором.
        </div>
      )}
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
