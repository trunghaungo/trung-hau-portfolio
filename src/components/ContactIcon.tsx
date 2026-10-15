export function ContactIcon({ name }: { name: string }) {
  if (name === 'behance') return <svg className="contact-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M2 6h7c2.5 0 4 1.2 4 3.2 0 1.1-.6 2-1.5 2.4 1.5.4 2.3 1.4 2.3 2.9 0 2.3-1.7 3.5-4.3 3.5H2V6Zm3.1 2.3v2.3h3.6c.8 0 1.3-.4 1.3-1.1 0-.8-.5-1.2-1.4-1.2H5.1Zm0 4.5v2.7h3.8c1 0 1.6-.5 1.6-1.3 0-.9-.6-1.4-1.6-1.4H5.1Z" />
    <path d="M15 6h6v1.6h-6zM18.1 9.1c2.5 0 4 1.8 4 4.2l-.1.8h-5.8c.1 1 .8 1.6 1.9 1.6.7 0 1.3-.3 1.6-.8h2.1c-.5 1.8-1.9 2.8-3.8 2.8-2.5 0-4.1-1.8-4.1-4.3 0-2.5 1.6-4.3 4.2-4.3Zm-1.9 3.4h3.7c-.1-.9-.8-1.5-1.8-1.5s-1.7.6-1.9 1.5Z" />
  </svg>;
  if (name === 'instagram') return <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".9" fill="currentColor" stroke="none" />
  </svg>;
  if (name === 'phone') return <svg className="contact-icon contact-icon--detail" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6.1 6.1l1.3-1.3a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
  </svg>;
  if (name === 'location') return <svg className="contact-icon contact-icon--detail" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z" /><circle cx="12" cy="10" r="2.4" />
  </svg>;
  return <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 18 18 6M8 6h10v10" /></svg>;
}
