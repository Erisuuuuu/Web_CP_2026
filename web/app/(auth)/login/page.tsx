import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-semibold">Войти</h1>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-gray-500">
        Нет аккаунта?{' '}
        <a href="/register" className="text-blue-600 hover:underline">
          Зарегистрироваться
        </a>
      </p>
    </div>
  )
}
