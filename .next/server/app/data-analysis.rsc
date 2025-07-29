1:"$Sreact.fragment"
3:I[4615,["615","static/chunks/615-85b8f973247d6caa.js","177","static/chunks/app/layout-71ead0ebbcfbc53c.js"],"Header"]
4:I[6982,["615","static/chunks/615-85b8f973247d6caa.js","177","static/chunks/app/layout-71ead0ebbcfbc53c.js"],"ToastProvider"]
5:I[7555,[],""]
6:I[1901,["39","static/chunks/app/error-f6d0f4be3dcadcc2.js"],"default"]
7:I[1295,[],""]
8:I[6874,["974","static/chunks/app/page-5666b3d8ff27738b.js"],""]
a:I[894,[],"ClientPageRoot"]
b:I[1202,["615","static/chunks/615-85b8f973247d6caa.js","904","static/chunks/app/data-analysis/page-9b6dc25232d0ac83.js"],"default"]
e:I[9665,[],"OutletBoundary"]
11:I[4911,[],"AsyncMetadataOutlet"]
13:I[9665,[],"ViewportBoundary"]
15:I[9665,[],"MetadataBoundary"]
17:I[6614,[],""]
:HL["/_next/static/css/1faa813c42781a16.css","style"]
2:T736,
  /* Critical styles for hero section */
  .gradient-text {
    background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    transition: all 0.3s ease;
  }
  
  .btn-outline {
    border: 2px solid #059669;
    color: #059669;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    transition: all 0.3s ease;
    background: transparent;
  }
  
  .btn-lg {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }
  
  /* Container and layout */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  /* Hero section critical styles */
  .hero-section {
    background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%);
    padding: 6rem 0;
    position: relative;
    overflow: hidden;
  }
  
  .hero-content {
    text-align: center;
    max-width: 64rem;
    margin: 0 auto;
  }
  
  .hero-title {
    font-size: 3.75rem;
    font-weight: 700;
    line-height: 1;
    color: #1e293b;
    margin-bottom: 1.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
    color: #475569;
    margin-bottom: 2.5rem;
    max-width: 48rem;
    margin-left: auto;
    margin-right: auto;
  }
  
  /* Responsive design */
  @media (max-width: 640px) {
    .hero-title {
      font-size: 2.5rem;
    }
    
    .hero-subtitle {
      font-size: 1.125rem;
    }
    
    .btn-lg {
      padding: 0.875rem 1.5rem;
      font-size: 1rem;
    }
  }
9:T5ed,
              // Initialize analytics and RUM when the page loads
              if (typeof window !== 'undefined') {
                window.addEventListener('load', function() {
                  // Initialize Plausible Analytics
                  if (!window.plausible) {
                    window.plausible = function(eventName, options) {
                      // Send to Plausible
                      if (window.plausible && typeof window.plausible === 'function') {
                        window.plausible(eventName, options);
                      }
                      // Log in development
                      if (process.env.NODE_ENV === 'development') {
                        console.log('📊 Analytics Event:', eventName, options);
                      }
                    };
                  }
                  
                  // Make trackPlausibleEvent available globally
                  window.trackPlausibleEvent = function x(e,t){};
                  
                  // Track initial page view
                  if (window.plausible) {
                    window.plausible('pageview');
                  }
                  
                  // Initialize RUM monitoring
                  try {
                    const { initializeRUM } = require('@/lib/rum');
                    initializeRUM();
                  } catch (error) {
                    console.warn('Failed to initialize RUM:', error);
                  }
                });
              }
            0:{"P":null,"b":"TrJbRUmxZLaXGBVQn4zvi","p":"","c":["","data-analysis"],"i":false,"f":[[["",{"children":["data-analysis",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/1faa813c42781a16.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","className":"__variable_e8ce0c __variable_4c860f","children":[["$","head",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"$2"}}],["$","link",null,{"rel":"preload","href":"/img/logo.webp","as":"image","type":"image/webp"}],["$","link",null,{"rel":"preload","href":"/img/hero-bg.webp","as":"image","type":"image/webp"}],["$","link",null,{"rel":"preconnect","href":"https://fonts.googleapis.com"}],["$","link",null,{"rel":"preconnect","href":"https://fonts.gstatic.com","crossOrigin":"anonymous"}],["$","link",null,{"rel":"preconnect","href":"https://plausible.io"}],["$","script",null,{"defer":true,"data-domain":"stratanoble.com","src":"https://plausible.io/js/script.js"}],["$","link",null,{"rel":"icon","href":"/favicon.svg","type":"image/svg+xml"}],["$","link",null,{"rel":"apple-touch-icon","href":"/apple-touch-icon.png"}],["$","link",null,{"rel":"manifest","href":"/manifest.json"}],["$","meta",null,{"name":"theme-color","content":"#003366"}],["$","meta",null,{"name":"msapplication-TileColor","content":"#003366"}],["$","meta",null,{"name":"viewport","content":"width=device-width, initial-scale=1"}],["$","script",null,{"type":"application/ld+json","dangerouslySetInnerHTML":{"__html":"{\"@context\":\"https://schema.org\",\"@type\":\"Organization\",\"name\":\"Strata Noble\",\"url\":\"https://stratanoble.com\",\"logo\":\"https://stratanoble.com/img/logo.webp\",\"description\":\"Transform your passion into a profitable business with expert guidance and proven strategies.\",\"address\":{\"@type\":\"PostalAddress\",\"addressLocality\":\"Las Vegas\",\"addressRegion\":\"NV\",\"addressCountry\":\"US\"},\"contactPoint\":{\"@type\":\"ContactPoint\",\"telephone\":\"+1-702-707-3168\",\"contactType\":\"customer service\",\"email\":\"contact@stratanoble.com\"},\"sameAs\":[\"https://linkedin.com/company/strata-noble\",\"https://twitter.com/stratanoble\"],\"serviceType\":\"Business Consulting\",\"areaServed\":\"Worldwide\"}"}}],["$","meta",null,{"name":"color-scheme","content":"light dark"}],["$","meta",null,{"name":"viewport","content":"width=device-width, initial-scale=1, viewport-fit=cover"}]]}],["$","body",null,{"className":"font-sans antialiased","children":[["$","$L3",null,{}],["$","$L4",null,{"children":["$","$L5",null,{"parallelRouterKey":"children","error":"$6","errorStyles":[],"errorScripts":[],"template":["$","$L7",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","div",null,{"className":"min-h-screen bg-gradient-to-br from-navy-50 to-silver-50 flex items-center justify-center px-4","children":["$","div",null,{"className":"max-w-md w-full text-center","children":[["$","div",null,{"className":"mb-8","children":["$","h1",null,{"className":"text-9xl font-bold text-navy-900/20","children":"404"}]}],["$","div",null,{"className":"mb-8","children":[["$","h2",null,{"className":"text-2xl font-bold text-navy-900 mb-4","children":"Page Not Found"}],["$","p",null,{"className":"text-navy-600 leading-relaxed","children":"The page you're looking for doesn't exist or has been moved. Let's get you back on track to transforming your passion into profit."}]]}],["$","div",null,{"className":"flex flex-col sm:flex-row gap-4 justify-center","children":[["$","$L8",null,{"href":"/","className":"btn-primary btn-lg inline-flex items-center justify-center group","children":[["$","svg",null,{"xmlns":"http://www.w3.org/2000/svg","fill":"none","viewBox":"0 0 24 24","strokeWidth":1.5,"stroke":"currentColor","aria-hidden":"true","data-slot":"icon","ref":"$undefined","aria-labelledby":"$undefined","className":"mr-2 h-5 w-5","children":[null,["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","d":"m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"}]]}],"Return Home"]}],["$","$L8",null,{"href":"/contact","className":"btn-outline btn-lg inline-flex items-center justify-center group","children":[["$","svg",null,{"xmlns":"http://www.w3.org/2000/svg","fill":"none","viewBox":"0 0 24 24","strokeWidth":1.5,"stroke":"currentColor","aria-hidden":"true","data-slot":"icon","ref":"$undefined","aria-labelledby":"$undefined","className":"mr-2 h-5 w-5","children":[null,["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","d":"M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"}]]}],"Contact Us"]}]]}],["$","div",null,{"className":"mt-12 pt-8 border-t border-silver-200","children":[["$","p",null,{"className":"text-sm text-navy-500 mb-4","children":"Or explore our services:"}],["$","div",null,{"className":"flex flex-wrap justify-center gap-4 text-sm","children":[["$","$L8",null,{"href":"/services","className":"text-emerald-600 hover:text-emerald-700 transition-colors","children":"Services"}],["$","$L8",null,{"href":"/about","className":"text-emerald-600 hover:text-emerald-700 transition-colors","children":"About"}],["$","$L8",null,{"href":"/case-studies","className":"text-emerald-600 hover:text-emerald-700 transition-colors","children":"Case Studies"}]]}]]}]]}]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}],["$","footer",null,{"className":"bg-navy-900","aria-labelledby":"footer-heading","children":[["$","h2",null,{"id":"footer-heading","className":"sr-only","children":"Footer"}],["$","div",null,{"className":"container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16","children":[["$","div",null,{"className":"xl:grid xl:grid-cols-3 xl:gap-8","children":[["$","div",null,{"className":"space-y-8 xl:col-span-1","children":[["$","div",null,{"className":"flex items-center gap-2 h-8 w-auto text-white","children":["$","div",null,{"className":"flex items-center","children":[["$","span",null,{"className":"text-2xl font-bold text-navy","children":"Strata"}],["$","span",null,{"className":"text-2xl font-bold text-emerald","children":"Noble"}]]}]}],["$","p",null,{"className":"text-sm leading-6 text-navy-300","children":"Transforming passion into profit through strategic excellence and proven business frameworks."}],["$","div",null,{"className":"flex space-x-6","children":[["$","a","LinkedIn",{"href":"#","className":"text-navy-400 hover:text-navy-300 transition-colors","aria-label":"Follow us on LinkedIn","children":[["$","span",null,{"className":"sr-only","children":"LinkedIn"}],["$","svg",null,{"fill":"currentColor","viewBox":"0 0 20 20","className":"h-6 w-6","aria-hidden":"true","children":["$","path",null,{"fillRule":"evenodd","d":"M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z","clipRule":"evenodd"}]}]]}],["$","a","Twitter",{"href":"#","className":"text-navy-400 hover:text-navy-300 transition-colors","aria-label":"Follow us on Twitter","children":[["$","span",null,{"className":"sr-only","children":"Twitter"}],["$","svg",null,{"fill":"currentColor","viewBox":"0 0 20 20","className":"h-6 w-6","aria-hidden":"true","children":["$","path",null,{"d":"M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"}]}]]}]]}]]}],["$","div",null,{"className":"mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0","children":[["$","div",null,{"className":"md:grid md:grid-cols-2 md:gap-8","children":[["$","div",null,{"children":[["$","h3",null,{"className":"text-sm font-semibold leading-6 text-white","children":"Services"}],["$","ul",null,{"role":"list","className":"mt-6 space-y-4","children":[["$","li","Idea to Execution",{"children":["$","$L8",null,{"href":"/services#idea-to-execution","className":"text-sm leading-6 text-navy-300 hover:text-white transition-colors","children":"Idea to Execution"}]}],["$","li","AI/No-Code Stack",{"children":["$","$L8",null,{"href":"/services#ai-nocode-stack","className":"text-sm leading-6 text-navy-300 hover:text-white transition-colors","children":"AI/No-Code Stack"}]}],["$","li","Ops & Delegation",{"children":["$","$L8",null,{"href":"/services#ops-blueprint","className":"text-sm leading-6 text-navy-300 hover:text-white transition-colors","children":"Ops & Delegation"}]}],["$","li","Workshops & Advisory",{"children":["$","$L8",null,{"href":"/services#workshops","className":"text-sm leading-6 text-navy-300 hover:text-white transition-colors","children":"Workshops & Advisory"}]}]]}]]}],["$","div",null,{"className":"mt-10 md:mt-0","children":[["$","h3",null,{"className":"text-sm font-semibold leading-6 text-white","children":"Company"}],["$","ul",null,{"role":"list","className":"mt-6 space-y-4","children":[["$","li","About",{"children":["$","$L8",null,{"href":"/about","className":"text-sm leading-6 text-navy-300 hover:text-white transition-colors","children":"About"}]}],["$","li","Case Studies",{"children":["$","$L8",null,{"href":"/case-studies","className":"text-sm leading-6 text-navy-300 hover:text-white transition-colors","children":"Case Studies"}]}],["$","li","Contact",{"children":["$","$L8",null,{"href":"/contact","className":"text-sm leading-6 text-navy-300 hover:text-white transition-colors","children":"Contact"}]}],["$","li","Blog",{"children":["$","$L8",null,{"href":"/blog","className":"text-sm leading-6 text-navy-300 hover:text-white transition-colors","children":"Blog"}]}]]}]]}]]}],["$","div",null,{"className":"md:grid md:grid-cols-2 md:gap-8","children":[["$","div",null,{"children":[["$","h3",null,{"className":"text-sm font-semibold leading-6 text-white","children":"Legal & Accessibility"}],["$","ul",null,{"role":"list","className":"mt-6 space-y-4","children":[["$","li","Privacy Policy",{"children":["$","$L8",null,{"href":"/privacy","className":"text-sm leading-6 text-navy-300 hover:text-white transition-colors","children":"Privacy Policy"}]}],["$","li","Terms of Service",{"children":["$","$L8",null,{"href":"/terms","className":"text-sm leading-6 text-navy-300 hover:text-white transition-colors","children":"Terms of Service"}]}],["$","li","Cookie Policy",{"children":["$","$L8",null,{"href":"/cookies","className":"text-sm leading-6 text-navy-300 hover:text-white transition-colors","children":"Cookie Policy"}]}],["$","li","Accessibility Statement",{"children":["$","$L8",null,{"href":"/accessibility","className":"text-sm leading-6 text-navy-300 hover:text-white transition-colors","children":"Accessibility Statement"}]}]]}]]}],["$","div",null,{"className":"mt-10 md:mt-0","children":[["$","h3",null,{"className":"text-sm font-semibold leading-6 text-white","children":"Newsletter"}],["$","p",null,{"className":"mt-6 text-sm leading-6 text-navy-300","children":"Get the latest insights and strategies delivered to your inbox."}],["$","form",null,{"className":"mt-6 sm:flex sm:max-w-md","children":[["$","label",null,{"htmlFor":"email-address","className":"sr-only","children":"Email address"}],["$","input",null,{"type":"email","name":"email-address","id":"email-address","autoComplete":"email","required":true,"className":"w-full min-w-0 appearance-none rounded-md border-0 bg-white/5 px-3 py-1.5 text-base text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-navy-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:w-56 sm:text-sm sm:leading-6","placeholder":"Enter your email","aria-describedby":"newsletter-description"}],["$","div",null,{"className":"mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0","children":["$","button",null,{"type":"submit","className":"flex w-full items-center justify-center rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 transition-colors","children":"Subscribe"}]}]]}],["$","p",null,{"id":"newsletter-description","className":"mt-2 text-xs text-navy-400","children":"We respect your privacy. Unsubscribe at any time."}]]}]]}]]}]]}],["$","div",null,{"className":"mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24","children":["$","div",null,{"className":"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4","children":[["$","p",null,{"className":"text-xs leading-5 text-navy-400","children":["© ",2025," Strata Noble. All rights reserved."]}],["$","div",null,{"className":"flex flex-wrap gap-4 text-xs text-navy-400","children":[["$","$L8",null,{"href":"/privacy","className":"hover:text-navy-300 transition-colors","children":"Privacy Policy"}],["$","$L8",null,{"href":"/accessibility","className":"hover:text-navy-300 transition-colors","children":"Accessibility Statement"}],["$","$L8",null,{"href":"/sitemap","className":"hover:text-navy-300 transition-colors","children":"Sitemap"}]]}]]}]}]]}]]}],["$","script",null,{"dangerouslySetInnerHTML":{"__html":"$9"}}]]}]]}]]}],{"children":["data-analysis",["$","$1","c",{"children":[null,["$","$L5",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L7",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":["__PAGE__",["$","$1","c",{"children":[["$","$La",null,{"Component":"$b","searchParams":{},"params":{},"promises":["$@c","$@d"]}],null,["$","$Le",null,{"children":["$Lf","$L10",["$","$L11",null,{"promise":"$@12"}]]}]]}],{},null,false]},null,false]},null,false],["$","$1","h",{"children":[null,["$","$1","qFGkLxngxVCcS8JvRcvK6v",{"children":[["$","$L13",null,{"children":"$L14"}],null]}],["$","$L15",null,{"children":"$L16"}]]}],false]],"m":"$undefined","G":["$17","$undefined"],"s":false,"S":true}
18:"$Sreact.suspense"
19:I[4911,[],"AsyncMetadata"]
c:{}
d:{}
16:["$","div",null,{"hidden":true,"children":["$","$18",null,{"fallback":null,"children":["$","$L19",null,{"promise":"$@1a"}]}]}]
10:null
14:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
f:null
12:{"metadata":[["$","title","0",{"children":"Strata Noble - Transform Your Passion Into Profit"}],["$","meta","1",{"name":"description","content":"We turn your passion into a profitable business through proven strategies, expert guidance, and systematic execution – because your vision deserves to thrive."}],["$","meta","2",{"name":"author","content":"Strata Noble"}],["$","meta","3",{"name":"keywords","content":"business strategy,startup consulting,passion to profit,business coaching,entrepreneurship"}],["$","meta","4",{"name":"creator","content":"Strata Noble"}],["$","meta","5",{"name":"publisher","content":"Strata Noble"}],["$","meta","6",{"name":"robots","content":"index, follow"}],["$","meta","7",{"name":"googlebot","content":"index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"}],["$","meta","8",{"name":"category","content":"business"}],["$","link","9",{"rel":"canonical","href":"https://stratanoble.com"}],["$","meta","10",{"name":"format-detection","content":"telephone=no, address=no, email=no"}],["$","meta","11",{"name":"google-site-verification","content":"your-google-verification-code"}],["$","meta","12",{"property":"og:title","content":"Strata Noble - Transform Your Passion Into Profit"}],["$","meta","13",{"property":"og:description","content":"We turn your passion into a profitable business through proven strategies, expert guidance, and systematic execution."}],["$","meta","14",{"property":"og:url","content":"https://stratanoble.com"}],["$","meta","15",{"property":"og:site_name","content":"Strata Noble"}],["$","meta","16",{"property":"og:locale","content":"en_US"}],["$","meta","17",{"property":"og:image","content":"https://stratanoble.com/img/og-image.jpg"}],["$","meta","18",{"property":"og:image:width","content":"1200"}],["$","meta","19",{"property":"og:image:height","content":"630"}],["$","meta","20",{"property":"og:image:alt","content":"Strata Noble - Business Strategy and Consulting"}],["$","meta","21",{"property":"og:type","content":"website"}],["$","meta","22",{"name":"twitter:card","content":"summary_large_image"}],["$","meta","23",{"name":"twitter:title","content":"Strata Noble - Transform Your Passion Into Profit"}],["$","meta","24",{"name":"twitter:description","content":"We turn your passion into a profitable business through proven strategies, expert guidance, and systematic execution."}],["$","meta","25",{"name":"twitter:image","content":"https://stratanoble.com/img/og-image.jpg"}]],"error":null,"digest":"$undefined"}
1a:{"metadata":"$12:metadata","error":null,"digest":"$undefined"}
