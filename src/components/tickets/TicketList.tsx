import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getUserTickets } from '../../lib/firebase';
import { useAuth } from '../../lib/hooks/useAuth';
import { Link } from 'react-router-dom';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  responses?: {
    id: string;
    content: string;
    createdAt: string;
    adminId: string;
  }[];
}

export function TicketList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      try {
        const userTickets = await getUserTickets(user.uid);
        setTickets(userTickets as Ticket[]);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicket(ticketId);
  };

  if (loading) {
    return <div className="text-center">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('ticket.yourTickets')}</h2>
        <Link
          to="/support"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {t('ticket.createNew')}
        </Link>
      </div>
      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{t('ticket.noTickets')}</p>
          <Link
            to="/support"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {t('ticket.createFirst')}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/support/${ticket.id}`}
              className={`block bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow ${selectedTicket === ticket.id ? 'selected' : ''}`}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium">{ticket.title}</h3>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                  ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {t(`ticket.priority${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}`)}
                </span>
              </div>
              <p className="mt-2 text-gray-600">{ticket.description}</p>
              
              {/* Support Responses Section */}
              {ticket.responses && ticket.responses.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-md font-medium mb-2">Support Responses</h4>
                  <div className="space-y-3">
                    {ticket.responses.map((response) => (
                      <div key={response.id} className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-700">{response.content}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(response.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                <span className={`px-2 py-1 rounded-full ${
                  ticket.status === 'new' ? 'bg-blue-100 text-blue-800' :
                  ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {t(`ticket.status${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}`)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}