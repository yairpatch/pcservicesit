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

  if (loading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.ticketManagement')}</h1>
        <div className="mt-4 sm:mt-0 flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('admin.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">{t('admin.filterAll')}</option>
            <option value="new">{t('ticket.statusNew')}</option>
            <option value="in_progress">{t('ticket.statusInProgress')}</option>
            <option value="resolved">{t('ticket.statusResolved')}</option>
          </select>
          <button onClick={() => handleSort('createdAt')} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
            {t('admin.sortByDate')} {sortField === 'createdAt' && (sortDirection === 'asc' ? t('admin.sortAscending') : t('admin.sortDescending'))}
          </button>
          <button onClick={() => handleSort('priority')} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
            {t('admin.sortByPriority')} {sortField === 'priority' && (sortDirection === 'asc' ? t('admin.sortAscending') : t('admin.sortDescending'))}
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      {t('ticket.id')}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      {t('ticket.title')}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      {t('ticket.priority')}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      {t('ticket.createdAt')}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      {t('ticket.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      {t('ticket.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {ticket.id}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          {getStatusIcon(ticket.status)}
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="ml-2 text-sm font-medium text-gray-900 hover:text-blue-600"
                          >
                            {ticket.title}
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="text-red-600 hover:text-red-900 ml-2"
                          title={t('admin.deleteTicket')}
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

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
                  {selectedTicket.responses?.map((response) => (
                    <div key={response.id} className="bg-gray-50 p-4 rounded-lg">
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
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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