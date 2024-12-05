import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createTicket } from '../../lib/firebase';
import { Link } from 'react-router-dom';
import { sendTicketConfirmationEmail } from '../../lib/emailService';

export function PublicTicketForm() {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const ticket = await createTicket({
        userId: email, // Using email as userId for anonymous tickets
        title,
        description,
        status: 'new',
        priority,
        customerEmail: email,
        customerName: name,
        isAnonymous: true
      });
      
      // Send confirmation email
      try {
        await sendTicketConfirmationEmail({
          customerEmail: email,
          customerName: name,
          ticketId: ticket.id,
          ticketTitle: title,
          ticketDescription: description,
          ticketPriority: priority
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Continue with the form submission even if email fails
      }

      setSubmitted(true);
      setTicketId(ticket.id);
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-green-600 mb-4">{t('support.ticketSubmitted')}</h2>
        <p className="mb-2">{t('support.ticketId')} <span className="font-mono font-bold">{ticketId}</span></p>
        <p className="text-gray-600">{t('support.updatesSentTo')} {email}</p>
        <p className="mt-4 text-sm text-gray-500">
          {t('support.keepTicketId')}
        </p>
        <div className="mt-6 space-y-4">
          <Link
            to={`/track?id=${ticketId}&email=${encodeURIComponent(email)}`}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t('support.trackTicket')}
          </Link>
          <button
            onClick={() => {
              setSubmitted(false);
              setTitle('');
              setDescription('');
              setPriority('medium');
              setEmail('');
              setName('');
            }}
            className="block mx-auto px-4 py-2 text-blue-600 hover:text-blue-700"
          >
            {t('support.submitAnother')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          {t('support.name')}
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          {t('support.email')}
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
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          {t('support.title')}
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          {t('support.description')}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          {t('support.priority')}
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="low">{t('support.priorityLow')}</option>
          <option value="medium">{t('support.priorityMedium')}</option>
          <option value="high">{t('support.priorityHigh')}</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {t('support.submit')}
      </button>
    </form>
  );
}
