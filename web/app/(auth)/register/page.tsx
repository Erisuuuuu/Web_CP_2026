import Link from 'next/link'
import RegisterForm from './RegisterForm'

export default function RegisterPage() {
  return (
    <div className="rounded-xl bg-white p-8 shadow-sm border" style={{ borderColor: '#e5ddd0' }}>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold" style={{ color: '#1c1917' }}>Создать аккаунт</h1>
        <p className="mt-1 text-sm" style={{ color: '#78716c' }}>Присоединяйтесь к LangClub</p>
      </div>
      <RegisterForm />
      <p className="mt-4 text-center text-sm" style={{ color: '#78716c' }}>
        Уже есть аккаунт?{' '}
        <Link href="/login" className="font-medium underline" style={{ color: '#1c1917' }}>
          Войти
        </Link>
      </p>
    </div>
  )
}
