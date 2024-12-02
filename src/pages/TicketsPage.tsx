import { Routes, Route } from 'react-router-dom';
import { TicketList } from '../components/tickets/TicketList';
import { TicketForm } from '../components/tickets/TicketForm';
import { useAuth } from '../lib/hooks/useAuth';
import { LoginForm } from '../components/auth/LoginForm';

export function TicketsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Please login to manage tickets</h2>
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Routes>
        <Route path="/" element={<TicketList />} />
        <Route path="/new" element={<TicketForm />} />
      </Routes>
    </div>
  );
}