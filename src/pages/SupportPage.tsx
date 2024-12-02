import { PublicTicketForm } from '../components/tickets/PublicTicketForm';

export function SupportPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Need Technical Support?</h1>
        <p className="text-lg text-gray-600">
          Fill out the form below and we'll get back to you as soon as possible.
        </p>
      </div>
      <PublicTicketForm />
    </div>
  );
}
