import { useTranslation } from 'react-i18next';
import { 
  Monitor, 
  Cpu, 
  Wifi, 
  Shield, 
  HardDrive, 
  Printer,
  Smartphone,
  Settings,
  Network
} from 'lucide-react';

export function ServicesPage() {
  const { t } = useTranslation();

  const services = [
    {
      icon: <Monitor className="h-8 w-8 text-blue-600" />,
      title: t('services.computerRepair'),
      description: t('services.computerRepairDesc'),
    },
    {
      icon: <Wifi className="h-8 w-8 text-blue-600" />,
      title: t('services.networking'),
      description: t('services.networkingDesc'),
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: t('services.security'),
      description: t('services.securityDesc'),
    },
    {
      icon: <HardDrive className="h-8 w-8 text-blue-600" />,
      title: t('services.dataRecovery'),
      description: t('services.dataRecoveryDesc'),
    },
    {
      icon: <Cpu className="h-8 w-8 text-blue-600" />,
      title: t('services.upgrade'),
      description: t('services.upgradeDesc'),
    },
    {
      icon: <Printer className="h-8 w-8 text-blue-600" />,
      title: t('services.printerSetup'),
      description: t('services.printerSetupDesc'),
    },
    {
      icon: <Smartphone className="h-8 w-8 text-blue-600" />,
      title: t('services.mobile'),
      description: t('services.mobileDesc'),
    },
    {
      icon: <Settings className="h-8 w-8 text-blue-600" />,
      title: t('services.maintenance'),
      description: t('services.maintenanceDesc'),
    },
    {
      icon: <Network className="h-8 w-8 text-blue-600" />,
      title: t('services.remote'),
      description: t('services.remoteDesc'),
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('services.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 mx-auto">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600 text-center">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('services.ctaTitle')}
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('services.ctaDescription')}
          </p>
          <a
            href="/support"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {t('services.ctaButton')}
          </a>
        </div>
      </div>
    </div>
  );
}
