import { PublicTicketForm } from '../components/tickets/PublicTicketForm';
import { useTranslation } from 'react-i18next';

export function SupportPage() {
  const { t } = useTranslation();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('support.title')}</h1>
        <p className="text-lg text-gray-600">
          {t('support.description')}
        </p>
      </div>
      <PublicTicketForm />
    </div>
  );
}
