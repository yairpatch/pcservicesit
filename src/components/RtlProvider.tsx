import { useTranslation } from 'react-i18next';
import { getDirection } from '../lib/utils';

interface RtlProviderProps {
  children: React.ReactNode;
}

export function RtlProvider({ children }: RtlProviderProps) {
  const { i18n } = useTranslation();

  return (
    <div dir={getDirection(i18n.language)} className="min-h-screen">
      {children}
    </div>
  );
}