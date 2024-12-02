import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { getTicketById } from '../lib/firebase';

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
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Ticket</h1>
        <p className="text-lg text-gray-600">
          Enter your ticket ID and email to check the status of your support request
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6 mb-8">
        <div>
          <label htmlFor="ticketId" className="block text-sm font-medium text-gray-700">
            Ticket ID
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
            Email Address
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
          {loading ? 'Loading...' : 'Track Ticket'}
        </button>
        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}
      </form>

      {ticket && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{ticket.title}</h3>
                <p className="mt-1 text-sm text-gray-500">Submitted by {ticket.customerName}</p>
              </div>
              <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(ticket.status)}`}>
                {formatStatus(ticket.status)}
              </span>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Description</h4>
                <p className="mt-1 text-sm text-gray-600">{ticket.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Priority</h4>
                <p className="mt-1 text-sm text-gray-600 capitalize">{ticket.priority}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Created</h4>
                <p className="mt-1 text-sm text-gray-600">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          {ticket.responses && ticket.responses.length > 0 && (
            <div className="px-6 py-5 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Support Responses</h4>
              <div className="space-y-4">
                {ticket.responses.map((response) => (
                  <div key={response.id} className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-700">{response.content}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      {new Date(response.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
