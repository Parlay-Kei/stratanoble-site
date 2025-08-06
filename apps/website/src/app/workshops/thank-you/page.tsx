// Workshop Thank-You Page | Passion-to-Prosperity

import React from "react";

export default function ThankYouPage() {
  // These could be dynamically injected via query params or server-side props in a real app
  const event_name = "Passion-to-Prosperity Workshop";
  const invitee_name = "Friend";
  const event_date = "[Event Date]";
  const event_time = "[Event Time]";

  return (
    <main className="max-w-2xl mx-auto px-4 pt-20 pb-12 text-gray-900">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🎉 You&apos;re booked for <span className="text-primary font-extrabold">{event_name}</span></h1>
        <p className="text-lg">Hi <span className="font-semibold">{invitee_name}</span>,<br />Your seat is locked in for <span className="font-semibold">{event_date} at {event_time}</span>.</p>
      </div>
      <hr className="my-8" />
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">What happens next</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li><b>Check your inbox</b> for a confirmation email and calendar invite.</li>
          <li><b>Add the workshop to your calendar</b> so you don&apos;t miss it.</li>
          <li><b>Download the Prep Workbook</b><br />
            <a href="https://drive.google.com/your-workbook-link" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Get the PDF</a>
          </li>
        </ol>
      </section>
      <hr className="my-8" />
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Workshop details</h2>
        <table className="w-full text-left mb-4 border border-gray-200">
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2 font-bold w-1/3">Duration</td>
              <td className="py-2">90 minutes</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 font-bold">Platform</td>
              <td className="py-2">Zoom (link inside your calendar invite)</td>
            </tr>
            <tr>
              <td className="py-2 font-bold">Goal</td>
              <td className="py-2">Map a realistic side-hustle you can launch this month</td>
            </tr>
          </tbody>
        </table>
        <div className="mb-2 font-semibold">Please have:</div>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>A notebook or digital notes app</li>
          <li>One clear income goal for the next 90 days</li>
          <li>Camera and mic ready for Q&amp;A</li>
        </ul>
      </section>
      <hr className="my-8" />
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Need to reschedule?</h2>
        <p>We get it: life happens. Use the <b>&quot;Cancel or Reschedule&quot;</b> link in your confirmation email no later than 24 hours before the session starts.</p>
      </section>
      <hr className="my-8" />
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Spread the word</h2>
        <p>Know someone who wants to build a side hustle? Share this link:<br />
          <span className="bg-gray-100 px-2 py-1 rounded text-sm select-all">https://calendly.com/stratanoble/workshop</span>
        </p>
      </section>
      <hr className="my-8" />
      <footer className="text-center mt-8">
        <p className="mb-1">See you soon,</p>
        <p className="font-semibold">Steve Hubbard</p>
        <p>Data &amp; Operations Analyst, Strata Noble Consulting</p>
        <a href="mailto:steve.hubbard@stratanova.com" className="text-blue-600 underline">steve.hubbard@stratanova.com</a>
      </footer>
    </main>
  );
} 