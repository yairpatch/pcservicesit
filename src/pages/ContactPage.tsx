import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export function ContactPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Contact Information */}
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">{t('contact.getInTouch')}</h2>
          <p className="mt-4 text-lg text-gray-500">{t('contact.description')}</p>
          
          <dl className="mt-8 space-y-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <dt className="text-lg font-medium text-gray-900">{t('contact.phone')}</dt>
                <dd className="mt-1 text-gray-500">+972-123-456-789</dd>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <dt className="text-lg font-medium text-gray-900">{t('contact.email')}</dt>
                <dd className="mt-1 text-gray-500">support@techfix.com</dd>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <dt className="text-lg font-medium text-gray-900">{t('contact.address')}</dt>
                <dd className="mt-1 text-gray-500">{t('contact.addressLine')}</dd>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <dt className="text-lg font-medium text-gray-900">{t('contact.hours')}</dt>
                <dd className="mt-1 text-gray-500">{t('contact.workingHours')}</dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Contact Form */}
        <div className="mt-12 lg:mt-0">
          <div className="bg-white py-10 px-6 rounded-lg shadow-lg sm:px-10">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t('contact.name')}
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('contact.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  {t('contact.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('contact.send')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}