/* eslint-disable react/no-unescaped-entities */

import { Link, type MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  const canonical = "https://www.ilovetimers.com/cookies";

  const title = "Cookies Policy | i💛Timers";
  const description =
    "Read the i💛Timers cookies policy. Learn how cookies and similar technologies are used on ilovetimers.com to run timers, remember preferences, measure performance, and serve ads.";

  const ogImage = "https://www.ilovetimers.com/og/ilovetimers-cookies.jpg";

  return [
    { title },
    { name: "description", content: description },

    { tagName: "link", rel: "canonical", href: canonical },

    { property: "og:site_name", content: "i💛Timers" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonical },
    { property: "og:image", content: ogImage },
    { property: "og:image:alt", content: "iLoveTimers cookies policy" },
    { property: "og:locale", content: "en_US" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },

    { name: "robots", content: "noindex,follow" },
  ];
};

export default function CookiesPolicy() {
  return (
    <div className="my-8 flex flex-col mx-10 items-center justify-center gap-8 font-nunito text-skull-brown">
      <header className="max-w-[1200px] w-full flex flex-col gap-3">
        <nav aria-label="Breadcrumb" className="text-sm font-lato">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li className="opacity-70">&gt;</li>
            <li aria-current="page" className="opacity-90">
              Cookies Policy
            </li>
          </ol>
        </nav>

        <h1 className="mb-5 flex py-2 text-4xl">COOKIE POLICY</h1>
        <h2 className="flex py-2 text-2xl">Last updated January 10, 2026</h2>

        <p className="flex flex-col gap-4 py-2">
          This Cookie Policy explains how https://www.ilovetimers.com
          ("Company", "we", "us", and "our") uses cookies and similar
          technologies to recognize you when you visit our website at
          https://www.ilovetimers.com ("Website"). It explains what these
          technologies are and why we use them, as well as your rights to
          control our use of them.
        </p>

        <p>
          In some cases we may use cookies and similar technologies to collect
          personal information, or that becomes personal information if we
          combine it with other information. For more information about how we
          handle personal information, please see our{" "}
          <Link to="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </header>

      <main className="flex max-w-[1200px] flex-col gap-8">
        <section className="flex flex-col gap-4">
          <h2 className="flex py-2 text-2xl">What are cookies?</h2>
          <p>
            Cookies are small data files that are placed on your computer or
            mobile device when you visit a website. Cookies are widely used by
            website owners in order to make their websites work, or to work more
            efficiently, as well as to provide reporting information.
          </p>
          <p>
            Cookies set by the website owner (in this case,
            https://www.ilovetimers.com) are called "first-party cookies."
            Cookies set by parties other than the website owner are called
            "third-party cookies." Third-party cookies enable third-party
            features or functionality to be provided on or through the website
            (for example, advertising, interactive content, and analytics). The
            parties that set these third-party cookies can recognize your device
            both when it visits the website in question and also when it visits
            certain other websites.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="flex py-2 text-2xl">Why do we use cookies?</h2>
          <p>
            We use first- and third-party cookies for several reasons. Some
            cookies are required for technical reasons in order for our Website
            to operate, and we refer to these as "essential" or "strictly
            necessary" cookies. Other cookies enable us to understand how our
            Website is used and to improve performance and user experience. We
            may also use cookies for advertising purposes, including serving ads
            and measuring ad performance. This is described in more detail
            below.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="flex py-2 text-2xl">
            Analytics and performance cookies
          </h2>
          <p>
            These cookies (and similar technologies) collect information that is
            used either in aggregate form to help us understand how our Website
            is being used, to improve site performance, and to help diagnose
            errors. We currently use PostHog for analytics, which may set
            cookies or use similar identifiers depending on your browser and our
            configuration.
          </p>
          <p>
            Note: The specific cookies and identifiers used can vary over time
            (for example, based on configuration changes or vendor updates).
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="flex py-2 text-2xl">Advertising cookies</h2>
          <p>
            We may display advertisements on our Website through Google AdSense
            and/or other advertising partners. Advertising providers may use
            cookies or similar technologies to serve ads, limit ad frequency,
            measure ad performance, and deliver ads that may be relevant to your
            interests.
          </p>

          <h3 className="text-xl">Google advertising cookies</h3>
          <p>
            Google uses cookies to help serve the ads it displays on the
            websites of its partners, such as websites displaying Google ads or
            participating in Google certified ad networks. When users visit a
            Google partner website, a cookie may be dropped on that user's
            browser.
          </p>

          <p className="flex flex-col gap-2">
            <Link
              to="https://policies.google.com/technologies/cookies"
              className="hover:underline"
            >
              Find out how Google uses cookies...
            </Link>
            <Link
              to="https://adssettings.google.com/"
              className="hover:underline"
            >
              Manage Google Ads Settings...
            </Link>
            <Link
              to="https://optout.aboutads.info/?c=2&lang=EN"
              className="hover:underline"
            >
              Opt out via aboutads.info...
            </Link>
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="flex py-2 text-2xl">How can I control cookies?</h2>
          <p>
            You have the right to decide whether to accept or reject cookies.
            You can usually exercise your cookie rights by setting your
            preferences in a cookie banner or consent manager (if we display
            one), or by changing your browser settings.
          </p>
          <p>
            Please note that essential cookies cannot be rejected in some cases
            because they are strictly necessary to provide you with core site
            functionality. If you choose to reject cookies, you may still use
            our Website, though your access to some functionality and areas of
            our Website may be restricted.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="flex py-2 text-2xl">
            How can I control cookies on my browser?
          </h2>
          <p>
            The means by which you can refuse cookies through your browser
            controls vary from browser to browser, so you should visit your
            browser's help menu for more information.
          </p>
          <p>
            Useful starting points:
            <span className="block mt-2">
              Chrome, Firefox, Safari, Edge, Opera
            </span>
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="flex py-2 text-2xl">
            What about other tracking technologies, like web beacons?
          </h2>
          <p>
            Cookies are not the only way to recognize or track visitors to a
            website. We may use other, similar technologies from time to time,
            like web beacons (sometimes called "tracking pixels" or "clear
            gifs"). These are tiny graphics files that contain a unique
            identifier that enables us to recognize when someone has visited our
            Website or interacted with our content. In many instances, these
            technologies rely on cookies to function properly, so declining
            cookies may impair their functioning.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="flex py-2 text-2xl">
            Do you use local storage or similar technologies?
          </h2>
          <p>
            Some site features and third-party tools may use local storage (such
            as Local Storage, Session Storage, IndexedDB, or similar) to store
            information on your device. These technologies are used for purposes
            similar to cookies, such as remembering preferences, improving site
            performance, and measuring usage.
          </p>
          <p>
            You can typically clear or control local storage through your
            browser settings. Disabling or clearing it may impact certain
            website functionality.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="flex py-2 text-2xl">
            How often will you update this Cookie Policy?
          </h2>
          <p>
            We may update this Cookie Policy from time to time in order to
            reflect changes to the cookies and technologies we use or for other
            operational, legal, or regulatory reasons. Please revisit this
            Cookie Policy regularly to stay informed about our use of cookies
            and related technologies.
          </p>
          <p>
            The date at the top of this Cookie Policy indicates when it was last
            updated.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="flex py-2 text-2xl">
            Where can I get further information?
          </h2>
          <p>
            If you have any questions about our use of cookies or other
            technologies, please contact us at: admin@ilovetimers.com.
          </p>
        </section>
      </main>
    </div>
  );
}
