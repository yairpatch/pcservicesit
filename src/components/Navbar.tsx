import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../lib/hooks/useAuth';
import { logoutUser } from '../lib/firebase';
import { 
  ComputerIcon, 
  PhoneIcon, 
  UserIcon, 
  LifeBuoyIcon, 
  SearchIcon 
} from 'lucide-react';

export function Navbar() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const navLinks = [
    {
      to: '/services',
      icon: <ComputerIcon className="h-5 w-5" />,
      label: t('nav.services'),
      className: 'text-gray-900'
    },
    {
      to: '/support',
      icon: <LifeBuoyIcon className="h-5 w-5" />,
      label: t('ticket.create'),
      className: 'text-white bg-blue-600 hover:bg-blue-700'
    },
    {
      to: '/track',
      icon: <SearchIcon className="h-5 w-5" />,
      label: t('ticket.track'),
      className: 'text-gray-900'
    },
    {
      to: '/contact',
      icon: <PhoneIcon className="h-5 w-5" />,
      label: t('nav.contact'),
      className: 'text-gray-900'
    }
  ];

  const authenticatedLinks = [
    {
      to: '/dashboard',
      icon: <UserIcon className="h-5 w-5" />,
      label: t('nav.admin'),
      className: 'text-gray-900'
    }
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <ComputerIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold">TechFix</span>
            </Link>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${link.className}`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}

              {user && authenticatedLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${link.className}`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {user ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => logoutUser()}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {t('auth.logout')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                {t('auth.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}