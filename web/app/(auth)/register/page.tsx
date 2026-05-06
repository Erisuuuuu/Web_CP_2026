import RegisterForm from './RegisterForm'

export default function RegisterPage() {
  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-semibold">Регистрация</h1>
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-gray-500">
        Уже есть аккаунт?{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Войти
        </a>
      </p>
    </div>
  )
}
