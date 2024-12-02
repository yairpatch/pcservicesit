import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Monitor, Shield, Cpu, Wifi } from 'lucide-react';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="relative bg-blue-600">
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              {t('hero.title')}
            </h1>
            <p className="mt-3 max-w-md mx-auto text-xl text-blue-100 sm:text-2xl md:mt-5 md:max-w-3xl">
              {t('hero.subtitle')}
            </p>
            <div className="mt-10">
              <Link
                to="/support"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 md:text-lg"
              >
                {t('hero.cta')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t('services.title')}
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              icon={<Monitor className="h-8 w-8" />}
              title={t('services.repair')}
            />
            <ServiceCard
              icon={<Shield className="h-8 w-8" />}
              title={t('services.virus')}
            />
            <ServiceCard
              icon={<Cpu className="h-8 w-8" />}
              title={t('services.upgrade')}
            />
            <ServiceCard
              icon={<Wifi className="h-8 w-8" />}
              title={t('services.network')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="text-blue-600 flex justify-center">{icon}</div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
    </div>
  );
}