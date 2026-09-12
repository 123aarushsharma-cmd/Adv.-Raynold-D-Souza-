// Helper utility to construct pre-filled mailto URLs for direct submission copies to Advocate Reynold D'Souza (advrdsouza181@gmail.com)

export interface ConsultationEmailData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export const ADVOCATE_PRIMARY_EMAIL = "advrdsouza181@gmail.com";

export function createConsultationMailtoUrl(data: ConsultationEmailData): string {
  const subject = encodeURIComponent(`[Olive Law Firm Consultation] ${data.subject} - ${data.name}`);
  const body = encodeURIComponent(
    `Respected Advocate Reynold D'Souza,\n\n` +
    `A new case consultation request has been submitted through the Olive Law Firm portal:\n\n` +
    `CLIENT DETAILS:\n` +
    `• Full Name: ${data.name}\n` +
    `• Email Address: ${data.email}\n` +
    `• Telephone / Phone: ${data.phone}\n` +
    `• Legal Specialty / Area: ${data.subject}\n\n` +
    `CASE DETAILS & DESCRIPTION:\n` +
    `${data.message}\n\n` +
    `---\n` +
    `Submitted via Olive Law Firm Official Portal\n` +
    `Destination: ${ADVOCATE_PRIMARY_EMAIL}\n` +
    `Date & Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`
  );

  return `mailto:${ADVOCATE_PRIMARY_EMAIL}?subject=${subject}&body=${body}`;
}

export function sendDirectEmailCopy(mailtoUrl: string) {
  try {
    const windowRef = window.open(mailtoUrl, '_blank');
    if (!windowRef) {
      window.location.href = mailtoUrl;
    }
  } catch (err) {
    window.location.href = mailtoUrl;
  }
}
