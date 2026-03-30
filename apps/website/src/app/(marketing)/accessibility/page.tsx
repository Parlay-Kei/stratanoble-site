import React from 'react';

export const dynamic = 'force-dynamic';


export default function AccessibilityStatement() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-command-navy mb-8">Accessibility Statement</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">Our Commitment</h2>
            <p className="text-gray-700 leading-relaxed">
              Strata Noble is committed to ensuring digital accessibility for people with disabilities. We are
              continually improving the user experience for everyone and applying the relevant accessibility standards.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">Conformance Status</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We strive to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong>.
              These guidelines explain how to make web content more accessible for people with disabilities and
              user-friendly for everyone.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our website is partially conformant with WCAG 2.1 Level AA. Partially conformant means that some
              parts of the content do not fully conform to the accessibility standard, and we are working to
              address these issues.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">Accessibility Features</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our website includes the following accessibility features:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Semantic HTML markup for proper document structure</li>
              <li>Keyboard navigation support for all interactive elements</li>
              <li>ARIA labels and landmarks for screen reader compatibility</li>
              <li>Sufficient color contrast ratios for text and backgrounds</li>
              <li>Resizable text without loss of content or functionality</li>
              <li>Alt text for images and meaningful graphics</li>
              <li>Clear and consistent navigation</li>
              <li>Form labels and error messages</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">Compatible Browsers and Assistive Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our website is designed to be compatible with the following assistive technologies:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
              <li>Screen magnification software</li>
              <li>Speech recognition software</li>
              <li>Keyboard-only navigation</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Tested with recent versions of Chrome, Firefox, Safari, and Edge browsers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">Known Limitations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Despite our efforts, some limitations may exist:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Some third-party embedded content may not be fully accessible</li>
              <li>Complex data visualizations may have limited screen reader support</li>
              <li>Some PDF documents may not be fully accessible (we are working to remediate these)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We are actively working to address these limitations and improve accessibility across our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">Feedback and Contact</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We welcome your feedback on the accessibility of Strata Noble. If you encounter accessibility
              barriers, please let us know:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Email:</strong>{' '}
                <a href="mailto:accessibility@stratanoble.com" className="text-forest-green hover:text-forest-green">
                  accessibility@stratanoble.com
                </a>
              </li>
              <li><strong>Phone:</strong> Available upon request</li>
              <li><strong>Response Time:</strong> We aim to respond within 2 business days</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">Technical Specifications</h2>
            <p className="text-gray-700 leading-relaxed">
              Accessibility of Strata Noble relies on the following technologies to work with the particular
              combination of web browser and assistive technologies or plugins installed on your computer:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
              <li>HTML5</li>
              <li>CSS3</li>
              <li>WAI-ARIA</li>
              <li>JavaScript (with graceful degradation)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">Assessment and Testing</h2>
            <p className="text-gray-700 leading-relaxed">
              Strata Noble assesses the accessibility of our website through:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
              <li>Self-evaluation using automated testing tools</li>
              <li>Manual testing with keyboard navigation</li>
              <li>Screen reader testing (NVDA, JAWS, VoiceOver)</li>
              <li>User feedback and reports</li>
              <li>Regular accessibility audits</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">Formal Complaints</h2>
            <p className="text-gray-700 leading-relaxed">
              If you are not satisfied with our response to your accessibility concern, you may file a
              formal complaint with:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
              <li>Our internal accessibility team at{' '}
                <a href="mailto:accessibility@stratanoble.com" className="text-forest-green hover:text-forest-green">
                  accessibility@stratanoble.com
                </a>
              </li>
              <li>The <a href="https://www.ada.gov/" target="_blank" rel="noopener noreferrer" className="text-forest-green hover:text-forest-green">
                U.S. Department of Justice ADA Information Line
              </a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">Ongoing Efforts</h2>
            <p className="text-gray-700 leading-relaxed">
              We are continuously working to improve the accessibility and usability of our website. Our
              ongoing efforts include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
              <li>Regular accessibility training for our development team</li>
              <li>Incorporating accessibility into our design and development process</li>
              <li>Conducting periodic accessibility audits</li>
              <li>Engaging with users with disabilities for feedback</li>
              <li>Updating this statement to reflect current practices</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
