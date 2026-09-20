export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" className="text-lg font-bold text-teal-600">MyToolzy</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-neutral-400 mb-10">Last updated: September 2026</p>

        <div className="space-y-8 text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Overview</h2>
            <p>
              MyToolzy ("we", "our", "the site") provides free online tools. This page explains
              what happens to your data when you use them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Tools that run entirely in your browser</h2>
            <p>
              Most tools on MyToolzy — including the Image Compressor, QR Code Generator, PDF
              Merge, Compress PDF, and Image Resizer — process your files locally, directly in
              your browser. These files are never uploaded to our servers or any third party.
              Closing or refreshing the page removes them completely, since they were never
              stored anywhere in the first place.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Tools that use a third-party service</h2>
            <p>
              Our PDF to Word tool requires real document conversion, which cannot be done in
              your browser alone. For this tool, your file is sent securely to our conversion
              partner, CloudConvert, solely to perform the conversion. CloudConvert processes the
              file and automatically deletes it after conversion, in line with its own data
              retention policy. We do not store a copy of your file, and we do not access its
              contents. You can read CloudConvert's own privacy practices at{" "}
              <a
                href="https://cloudconvert.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 underline"
              >
                cloudconvert.com/privacy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">No accounts, no sign-up</h2>
            <p>
              MyToolzy does not require you to create an account or log in. We do not collect
              names, emails, or passwords to use any tool on this site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Cookies and analytics</h2>
            <p>
              We may use basic analytics (such as Google Analytics) to understand how many people
              visit the site and which tools are popular. This data is anonymous and aggregated —
              it does not identify you personally. If we display ads in the future (such as Google
              AdSense), those services may use cookies to show relevant ads. You can control
              cookies through your browser settings at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Children's privacy</h2>
            <p>
              MyToolzy is not directed at children under 13, and we do not knowingly collect any
              information from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Changes to this policy</h2>
            <p>
              We may update this Privacy Policy as we add new tools or features. Any changes will
              be posted on this page with an updated date at the top.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Contact us</h2>
            <p>
              If you have any questions about this Privacy Policy, you can reach us at{" "}
              <a href="mailto:chatherusman07@gmail.com" className="text-teal-600 underline">
                chatherusman07@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}