import { useTranslation } from 'react-i18next';
import { LoginForm } from '../components/auth/LoginForm';

export function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.login')}
          </h2>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}