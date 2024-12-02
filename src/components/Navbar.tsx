import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../lib/hooks/useAuth';
import { logoutUser } from '../lib/firebase';
import { useState } from 'react';
import { 
  ComputerIcon, 
  PhoneIcon, 
  UserIcon, 
  LifeBuoyIcon, 
  SearchIcon,
  MenuIcon,
  XIcon
} from 'lucide-react';

export function Navbar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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
              <div className="hidden sm:flex items-center space-x-4">
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
                className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {t('auth.login')}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <XIcon className="block h-6 w-6" />
              ) : (
                <MenuIcon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-3 py-2 text-base font-medium rounded-md ${
                link.className === 'text-white bg-blue-600 hover:bg-blue-700'
                  ? 'text-white bg-blue-600 hover:bg-blue-700'
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span className="inline-flex items-center">
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </span>
            </Link>
          ))}

          {user && authenticatedLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              <span className="inline-flex items-center">
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </span>
            </Link>
          ))}

          {user ? (
            <button
              onClick={() => {
                logoutUser();
                setIsOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
            >
              {t('auth.logout')}
            </button>
          ) : (
            <Link
              to="/login"
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              {t('auth.login')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}