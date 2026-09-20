export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" className="text-lg font-bold text-teal-600">MyToolzy</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-neutral-400 mb-10">Last updated: September 2026</p>

        <div className="space-y-8 text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">1. Agreement to Terms</h2>
            <p>
              By accessing or using MyToolzy ("the site", "we", "our"), you agree to be bound by
              these Terms of Service. If you do not agree, please do not use the site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">2. Description of Service</h2>
            <p>
              MyToolzy provides free online tools, including but not limited to image
              compression, image resizing, QR code generation, PDF merging, PDF compression, and
              PDF to Word conversion. Most tools process files locally in your browser; some
              tools rely on a third-party service to function, as described in our{" "}
              <a href="/privacy" className="text-teal-600 underline">Privacy Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">3. No Account Required</h2>
            <p>
              MyToolzy does not require registration or an account to use any tool on this site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">4. Acceptable Use</h2>
            <p>You agree not to use MyToolzy to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Process files that you do not have the legal right to use or modify</li>
              <li>Upload or process any unlawful, harmful, or infringing content</li>
              <li>Attempt to disrupt, overload, or gain unauthorized access to the site or its infrastructure</li>
              <li>Use automated systems (bots, scrapers) to abuse the tools at scale in a way that degrades service for others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">5. Your Content</h2>
            <p>
              Any files you process using MyToolzy remain your own. For tools that run in your
              browser, we never receive or store your files. For tools that use a third-party
              conversion service, your file is transmitted solely to perform the requested
              conversion and is not retained by us afterward.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">6. Service Availability</h2>
            <p>
              MyToolzy is provided on an "as is" and "as available" basis. We do not guarantee
              that the site or any tool will be uninterrupted, error-free, or available at all
              times. Some tools depend on third-party services and may be subject to usage limits
              beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">7. No Warranty</h2>
            <p>
              MyToolzy's tools are provided for general convenience. We make no warranty as to the
              accuracy, completeness, or fitness of any output (such as a converted, compressed,
              or merged file) for a particular purpose. You are responsible for reviewing the
              output before relying on it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, MyToolzy and its operators shall not be
              liable for any indirect, incidental, or consequential damages arising from your use
              of, or inability to use, the site or any tool.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">9. Advertising</h2>
            <p>
              MyToolzy may display third-party advertisements (such as Google AdSense) to support
              the free operation of the site. We are not responsible for the content of
              third-party ads.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">10. Changes to These Terms</h2>
            <p>
              We may update these Terms of Service from time to time. Continued use of the site
              after changes are posted constitutes your acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">11. Contact</h2>
            <p>
              Questions about these Terms can be sent via our{" "}
              <a href="/contact" className="text-teal-600 underline">Contact page</a>.
            </p>
          </section>
        </div>
      </div>

      <footer className="border-t border-neutral-200 py-8 mt-12">
        <div className="max-w-3xl mx-auto px-6 flex justify-between text-sm text-neutral-500">
          <span>© 2026 MyToolzy</span>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-teal-600">Privacy Policy</a>
            <a href="/contact" className="hover:text-teal-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}