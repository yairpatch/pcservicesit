import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
const PUBLIC_KEY = import.meta.env.VITE_REACT_APP_EMAILJS_PUBLIC_KEY; 
const SERVICE_ID = import.meta.env.VITE_REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_REACT_APP_EMAILJS_TEMPLATE_ID;

interface TicketEmailParams {
  customerEmail: string;
  customerName: string;
  ticketId: string;
  ticketTitle: string;
  ticketDescription: string;
  ticketPriority: string;
}

export const sendTicketConfirmationEmail = async (params: TicketEmailParams) => {
  try {
    if (!PUBLIC_KEY || !SERVICE_ID || !TEMPLATE_ID) {
      throw new Error('EmailJS configuration is missing');
    }

    const templateParams = {
      to_email: params.customerEmail,
      to_name: params.customerName,
      ticket_id: params.ticketId,
      ticket_title: params.ticketTitle,
      ticket_description: params.ticketDescription,
      ticket_priority: params.ticketPriority,
      tracking_link: `${window.location.origin}/track?id=${params.ticketId}&email=${encodeURIComponent(params.customerEmail)}`,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
