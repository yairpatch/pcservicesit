import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { getTicketById, addTicketResponse } from '../lib/firebase';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  responses?: {
    id: string;
    content: string;
    createdAt: string;
    adminId: string;
    isUserResponse?: boolean;
  }[];
}

export function TrackTicketPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [ticketId, setTicketId] = useState(searchParams.get('id') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userResponse, setUserResponse] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    const emailParam = searchParams.get('email');
    if (id && emailParam) {
      setTicketId(id);
      setEmail(emailParam);
      fetchTicket(id, emailParam);
    }
  }, [searchParams]);

  const fetchTicket = async (id: string, emailParam: string) => {
    setError('');
    setLoading(true);
    
    try {
      const fetchedTicket = await getTicketById(id, emailParam);
      setTicket(fetchedTicket as Ticket);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message === 'Ticket not found' 
          ? 'No ticket found with this ID' 
          : error.message === 'Unauthorized access'
          ? 'The email provided does not match the ticket'
          : 'An error occurred while fetching the ticket'
        );
      }
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchTicket(ticketId, email);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return t(`ticket.status${status.charAt(0).toUpperCase() + status.slice(1)}`);
  };

  const formatPriority = (priority: string) => {
    return t(`ticket.priority${priority.charAt(0).toUpperCase() + priority.slice(1)}`);
  };

  const handleUserResponse = async () => {
    if (!userResponse.trim() || !ticket) return;

    try {
      await addTicketResponse(ticket.id, {
        content: userResponse,
        adminId: ticket.customerEmail,
        createdAt: new Date().toISOString(),
        isUserResponse: true
      });

      // Update local state
      setTicket(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          responses: [...(prev.responses || []), {
            id: Date.now().toString(),
            content: userResponse,
            adminId: ticket.customerEmail,
            createdAt: new Date().toISOString(),
            isUserResponse: true
          }]
        };
      });
      setUserResponse('');
    } catch (error) {
      setError(t('track.responseError'));
    }
  };

  const canUserRespond = () => {
    if (!ticket?.responses || ticket.responses.length === 0) {
      // If no responses yet, user cannot respond
      return false;
    }

    // Get the last response
    const lastResponse = ticket.responses[ticket.responses.length - 1];
    
    // User can only respond if the last response was from support (not a user response)
    return !lastResponse.isUserResponse;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('track.title')}</h1>
        <p className="text-lg text-gray-600">
          {t('track.description')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6 mb-8">
        <div>
          <label htmlFor="ticketId" className="block text-sm font-medium text-gray-700">
            {t('track.ticketId')}
          </label>
          <input
            type="text"
            id="ticketId"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t('track.email')}
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? t('track.loading') : t('track.trackButton')}
        </button>
        {error && (
          <p className="text-red-600 text-sm text-center">{t(`track.${error === 'No ticket found with this ID' ? 'noTicket' : error === 'The email provided does not match the ticket' ? 'unauthorized' : 'error'}`)}</p>
        )}
      </form>

      {ticket && (
        <div className="mt-8 bg-white shadow-sm rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{t('track.ticketDetails')}</h3>
              <dl className="mt-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <dt>{t('track.submittedBy')}</dt>
                  <dd>{ticket.customerEmail}</dd>
                </div>
                <div className="flex justify-between mt-1">
                  <dt>{t('track.status')}</dt>
                  <dd>{formatStatus(ticket.status)}</dd>
                </div>
                <div className="flex justify-between mt-1">
                  <dt>{t('track.priority')}</dt>
                  <dd>{formatPriority(ticket.priority)}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900">{t('track.description')}</h4>
              <p className="mt-2 text-sm text-gray-500">{ticket.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">{t('track.responses')}</h4>
              {ticket.responses && ticket.responses.length > 0 ? (
                <div className="space-y-3">
                  {ticket.responses.map((response) => (
                    <div
                      key={response.id}
                      className={`p-4 rounded-lg ${
                        response.isUserResponse
                          ? 'bg-blue-50 ml-4'
                          : 'bg-gray-50 mr-4'
                      }`}
                    >
                      <p className="text-sm text-gray-700">{response.content}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {response.isUserResponse ? t('track.you') : t('track.support')} -{' '}
                        {new Date(response.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t('track.noResponses')}</p>
              )}

              {canUserRespond() ? (
                <div className="mt-4">
                  <label htmlFor="userResponse" className="block text-sm font-medium text-gray-700">
                    {t('track.yourResponse')}
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="userResponse"
                      rows={3}
                      className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                      value={userResponse}
                      onChange={(e) => setUserResponse(e.target.value)}
                    />
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={handleUserResponse}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {t('track.submitResponse')}
                    </button>
                  </div>
                </div>
              ) : ticket.responses && ticket.responses.length > 0 ? (
                <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-700">
                    {t('track.waitingForSupport')}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
