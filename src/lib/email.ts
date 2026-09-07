// Helper utility to construct pre-filled mailto URLs for direct submission copies to Advocate Reynold D'Souza (advrdsouza181@gmail.com)

export interface ConsultationEmailData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface InternshipEmailData {
  name: string;
  email: string;
  phone: string;
  college: string;
  yearOfStudy: string;
  areaOfInterest: string;
  resumeUrl: string;
  coverLetter: string;
}

export const ADVOCATE_PRIMARY_EMAIL = "advrdsouza181@gmail.com";

export function createConsultationMailtoUrl(data: ConsultationEmailData): string {
  const subject = encodeURIComponent(`[Olive Law Chambers Consultation] ${data.subject} - ${data.name}`);
  const body = encodeURIComponent(
    `Respected Advocate Reynold D'Souza,\n\n` +
    `A new case consultation request has been submitted through the Olive Law Chambers portal:\n\n` +
    `CLIENT DETAILS:\n` +
    `• Full Name: ${data.name}\n` +
    `• Email Address: ${data.email}\n` +
    `• Telephone / Phone: ${data.phone}\n` +
    `• Legal Specialty / Area: ${data.subject}\n\n` +
    `CASE DETAILS & DESCRIPTION:\n` +
    `${data.message}\n\n` +
    `---\n` +
    `Submitted via Olive Law Chambers Official Portal\n` +
    `Destination: ${ADVOCATE_PRIMARY_EMAIL}\n` +
    `Date & Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`
  );

  return `mailto:${ADVOCATE_PRIMARY_EMAIL}?subject=${subject}&body=${body}`;
}

export function createInternshipMailtoUrl(data: InternshipEmailData): string {
  const subject = encodeURIComponent(`[Chambers Internship Application] ${data.name} - ${data.college}`);
  const body = encodeURIComponent(
    `Respected Advocate Reynold D'Souza,\n\n` +
    `A new internship application dossier has been submitted through the Olive Law Chambers portal:\n\n` +
    `APPLICANT DETAILS:\n` +
    `• Full Candidate Name: ${data.name}\n` +
    `• Email Address: ${data.email}\n` +
    `• Phone Number: ${data.phone}\n` +
    `• Law School / College: ${data.college}\n` +
    `• Year of Academic Study: ${data.yearOfStudy}\n` +
    `• Area of Legal Practice Interest: ${data.areaOfInterest}\n` +
    `• Resume Portfolio URL: ${data.resumeUrl}\n\n` +
    `COVER LETTER / STATEMENT OF INTENT:\n` +
    `${data.coverLetter}\n\n` +
    `---\n` +
    `Submitted via Olive Law Chambers Official Portal\n` +
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
