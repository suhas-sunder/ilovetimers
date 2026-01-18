/* eslint-disable react/no-unescaped-entities */
import { Link } from "react-router";
import type { Route } from "./+types/terms";

export const meta: Route.MetaFunction = () => {
  const canonical = "https://www.ilovetimers.com/terms";

  const title = "Terms of Service | iLoveTimers";
  const description =
    "Read the iLoveTimers Terms of Service. Learn about your rights and responsibilities when using ilovetimers.com.";

  const ogImage = "https://www.ilovetimers.com/og/ilovetimers-terms.jpg";

  return [
    { title },
    { name: "description", content: description },

    { tagName: "link", rel: "canonical", href: canonical },

    { property: "og:site_name", content: "iLoveTimers" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonical },
    { property: "og:image", content: ogImage },
    { property: "og:image:alt", content: "iLoveTimers terms of service" },
    { property: "og:locale", content: "en_US" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },

    { name: "robots", content: "noindex,follow" },
  ];
};

export default function TermsOfService() {
  return (
    <div className="my-8 mx-10 flex flex-col items-center justify-center gap-8 font-nunito text-skull-brown">
      <main className="flex max-w-[1200px] flex-col gap-8">
        <section>
          <h2 className="text-2xl">1. OUR SERVICES</h2>
          <p>
            The Services provide free online timer, stopwatch, countdown,
            Pomodoro, interval, productivity, and clock-based tools. The
            information provided through the Services is for general
            informational and utility purposes only.
          </p>
          <p>
            The Services are not tailored to comply with industry-specific
            regulations (HIPAA, FISMA, etc.). If your interactions would be
            subjected to such laws, you may not use the Services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">2. INTELLECTUAL PROPERTY RIGHTS</h2>
          <p>
            We own or license all intellectual property rights in the Services,
            including software, design, text, graphics, and trademarks.
          </p>
          <p>
            The Services are provided "AS IS" for your personal, non-commercial
            use only.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">3. USER REPRESENTATIONS</h2>
          <p>
            By using the Services, you represent that you will not use the
            Services for illegal or unauthorized purposes and that your use
            complies with applicable laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">4. USER REGISTRATION</h2>
          <p>
            We may offer optional accounts in the future. You are responsible
            for safeguarding any credentials associated with your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">5. PRODUCTS</h2>
          <p>
            Some Services may be free or include optional paid features in the
            future. All offerings are subject to availability.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">6. PURCHASES AND PAYMENT</h2>
          <p>
            If purchases or subscriptions are offered, payment processing may be
            handled by third-party providers such as Stripe.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">7. REFUNDS POLICY</h2>
          <p>
            All sales are final unless otherwise required by applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">8. PROHIBITED ACTIVITIES</h2>
          <p>
            You may not misuse the Services, interfere with their operation, or
            attempt to gain unauthorized access.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">9. DISCLAIMER</h2>
          <p>
            THE SERVICES ARE PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS
            WITHOUT WARRANTIES OF ANY KIND.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">10. LIMITATIONS OF LIABILITY</h2>
          <p>
            IN NO EVENT SHALL ILOVETIMERS BE LIABLE FOR ANY INDIRECT OR
            CONSEQUENTIAL DAMAGES ARISING FROM USE OF THE SERVICES.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">11. GOVERNING LAW</h2>
          <p>
            These Legal Terms shall be governed by the laws of Canada and the
            Province of Ontario.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">12. CONTACT US</h2>
          <p>
            Questions about these Terms can be sent to: admin@ilovetimers.com
          </p>
        </section>
      </main>
    </div>
  );
}
