'use client';

import { useEffect } from 'react';

interface CalendlyWidgetProps {
  url: string;
}

const CalendlyWidget = ({ url }: CalendlyWidgetProps) => {
  useEffect(() => {
    const scriptId = 'calendly-script';
    if (document.getElementById(scriptId)) {
      // Script already loaded or loading
      // Potentially, re-initialize if Calendly object is available
      // For now, assume Calendly handles multiple widget initializations if script is present
      if (window.Calendly) {
        // If the widget div is already there, Calendly might not re-initialize.
        // To be safe, one might remove the old widget div before adding a new one,
        // or ensure this component instance is unique per page.
        // For this spec, we assume a single widget instance.
      }
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'text/javascript';
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;

    script.onload = () => {
      // Script loaded, Calendly object should be available.
      // The div with data-url should be picked up automatically.
      // If specific initialization is needed:
      // window.Calendly.initInlineWidget({
      //   url: url,
      //   parentElement: document.getElementById('calendly-inline-widget'),
      // });
    };

    script.onerror = () => {
      console.error('Failed to load Calendly script.');
    };

    document.head.appendChild(script);

    return () => {
      // Optional: Cleanup script if component unmounts, though often not necessary for global scripts.
      // const loadedScript = document.getElementById(scriptId);
      // if (loadedScript) {
      //   document.head.removeChild(loadedScript);
      // }
      // Also, Calendly might create iframes or other elements that need cleanup.
      // For now, keeping it simple as per spec "Inject Calendly inline script once".
    };
  }, [url]);

  return (
    <div
      id="calendly-inline-widget"
      data-url={url}
      className="calendly-inline-widget"
      style={{ minWidth: '320px', height: '700px' }} // Default height, can be adjusted
    >
      {/* Calendly widget will load here */}
    </div>
  );
};

export default CalendlyWidget;
