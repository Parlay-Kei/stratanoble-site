import React, { useState } from 'react';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Placeholder: Integrate with your email provider (e.g., Mailchimp, ConvertKit) here
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-8 max-w-xl w-full flex flex-col items-center text-center border border-accent/40 mx-auto mt-16">
      <h2 className="font-headings text-xl md:text-2xl font-bold text-primary mb-2">Stay in the Loop</h2>
      <p className="text-primary/80 mb-6 text-base">Get occasional updates, workshop invites, and smart founder tips. No spam, ever.</p>
      {submitted ? (
        <div className="text-highlight font-medium">Thank you for subscribing!</div>
      ) : (
        <form className="w-full flex flex-col sm:flex-row gap-4 justify-center" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            required
            placeholder="Your email address"
            className="input flex-1 min-w-0"
            aria-label="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary font-bold px-8 py-3"
            style={{ minWidth: 120 }}
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
};

export default NewsletterSignup; 