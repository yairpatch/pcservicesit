import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/hooks/useAuth';
import { getAllTickets, updateTicketStatus, addTicketResponse, deleteTicket } from '../lib/firebase';
import { AlertTriangle, CheckCircle, Clock, Search, ArrowUpDown, X, TrashIcon } from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  userId: string;
  responses?: TicketResponse[];
}

interface TicketResponse {
  id: string;
  content: string;
  createdAt: string;
  adminId: string;
  isUserResponse?: boolean;
  readByAdmin?: boolean;
}

export function AdminPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'createdAt' | 'priority'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      console.log('Auth state:', { user, authLoading });
      
      if (authLoading) {
        console.log('Auth is still loading...');
        return;
      }

      if (!user) {
        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
      }

      try {
        console.log('Starting to fetch tickets...');
        const allTickets = await getAllTickets();
        console.log('Fetched tickets:', allTickets);
        setTickets(allTickets as Ticket[]);
      } catch (error) {
        setError(t('admin.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, authLoading, navigate, t]);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await updateTicketStatus(ticketId, newStatus);
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      ));
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (window.confirm(t('admin.confirmDelete'))) {
      try {
        await deleteTicket(ticketId);
        setTickets(tickets.filter(ticket => ticket.id !== ticketId));
      } catch (error) {
        setError(t('admin.deleteError'));
      }
    }
  };

  const handleSort = (field: 'createdAt' | 'priority') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleResponse = async (ticketId: string) => {
    if (!response.trim() || !user) return;
    
    try {
      await addTicketResponse(ticketId, {
        content: response,
        adminId: user.uid,
        createdAt: new Date().toISOString(),
      });
      
      // Update local state
      setTickets(tickets.map(ticket => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            responses: [...(ticket.responses || []), {
              id: Date.now().toString(),
              content: response,
              adminId: user.uid,
              createdAt: new Date().toISOString(),
            }],
          };
        }
        return ticket;
      }));
      
      setResponse('');
    } catch (error) {
      console.error('Error adding response:', error);
    }
  };

  const getTicketIcon = (ticket: Ticket) => {
    // Show notification badge if there are user responses
    const hasNewUserResponses = ticket.responses?.some(
      (response) => response.isUserResponse && !response.readByAdmin
    );

    if (hasNewUserResponses) {
      return (
        <div className="relative">
          {getStatusIcon(ticket.status)}
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        </div>
      );
    }

    return getStatusIcon(ticket.status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const sortedTickets = tickets
    .filter(ticket => 
      (filter === 'all' || ticket.status === filter) &&
      (searchQuery === '' || 
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'createdAt') {
        return modifier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      if (sortField === 'priority') {
        const priorityOrder: { [key: string]: number } = { low: 1, medium: 2, high: 3 };
        return modifier * (priorityOrder[a.priority] - priorityOrder[b.priority]);
      }
      return 0;
    });

  if (loading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" dir={t('direction')}>
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('admin.ticketManagement')}</h1>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('admin.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 rtl:left-3 rtl:right-auto" />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('admin.filters.all')}</option>
            <option value="new">{t('admin.filters.new')}</option>
            <option value="in_progress">{t('admin.filters.in_progress')}</option>
            <option value="resolved">{t('admin.filters.resolved')}</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => handleSort('createdAt')}
              className="inline-flex items-center px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
            >
              {t('admin.sort.date')}
              <ArrowUpDown className="ml-1 rtl:mr-1 rtl:ml-0 h-4 w-4" />
            </button>
            <button
              onClick={() => handleSort('priority')}
              className="inline-flex items-center px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
            >
              {t('admin.sort.priority')}
              <ArrowUpDown className="ml-1 rtl:mr-1 rtl:ml-0 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block mt-8">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
              <table className="min-w-full divide-y divide-gray-300" dir={t('direction')}>
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-start text-sm font-semibold text-gray-900">
                      {t('ticket.title')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">
                      {t('ticket.priority')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">
                      {t('ticket.status')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">
                      {t('ticket.createdAt')}
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4">
                      <span className="sr-only">{t('admin.actions')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                        <div className="flex items-center">
                          {getTicketIcon(ticket)}
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="ms-2 font-medium text-gray-900 hover:text-blue-600"
                          >
                            {ticket.title}
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {t(`ticket.priority${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}`)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          className="rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="new">{t('ticket.statusNew')}</option>
                          <option value="in_progress">{t('ticket.statusInProgress')}</option>
                          <option value="resolved">{t('ticket.statusResolved')}</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString(t('locale'))}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-end text-sm font-medium">
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden mt-6 space-y-4">
        {sortedTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white rounded-lg shadow-sm border p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <div className="flex-shrink-0">
                  {getTicketIcon(ticket)}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {ticket.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {ticket.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100">
                      {new Date(ticket.createdAt).toLocaleDateString(t('locale'))}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {t(`ticket.priority${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}`)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                className="text-sm border rounded px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">{t('ticket.statusNew')}</option>
                <option value="in_progress">{t('ticket.statusInProgress')}</option>
                <option value="resolved">{t('ticket.statusResolved')}</option>
              </select>
              <button
                onClick={() => handleDeleteTicket(ticket.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {sortedTickets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('admin.noTickets')}</p>
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-900">{selectedTicket.title}</h2>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium text-gray-900">{t('ticket.description')}</h3>
                <p className="mt-2 text-gray-600">{selectedTicket.description}</p>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-gray-900">{t('admin.responses')}</h3>
                <div className="mt-2 space-y-4">
                  {selectedTicket.responses?.map((response, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        response.isUserResponse ? 'bg-blue-50' : 'bg-gray-50'
                      }`}
                    >
                      <p className="text-gray-600">{response.content}</p>
                      <p className="mt-2 text-sm text-gray-500">
                        {new Date(response.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="response" className="block font-medium text-gray-900">
                  {t('admin.addResponse')}
                </label>
                <textarea
                  id="response"
                  rows={3}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleResponse(selectedTicket.id)}
                  disabled={!response.trim()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {t('admin.submit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}