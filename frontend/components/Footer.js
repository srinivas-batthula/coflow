export default function Footer() {
  return (
    <footer className="w-full bg-[#f5f1fc] py-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Year */}
        <div className="flex items-center gap-3">
          <span
            onClick={() => (window.location.href = '/')}
            className="font-black text-3xl text-[#320398] tracking-tight cursor-pointer"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <span className="inline-block align-middle">🚀</span> CoFlow
          </span>
          <span className="text-gray-500 text-base font-medium ml-2">
            © {new Date().getFullYear()}
          </span>
        </div>

        {/* Tagline & Mission */}
        <div className="text-gray-700 text-base text-center md:text-right leading-relaxed max-w-xl">
          <span className="block font-semibold text-[#320398] mb-1">
            Empowering Innovators, Teams & Communities
          </span>
          <span>
            CoFlow is your launchpad to discover, join, and win hackathons worldwide.
            <br className="hidden md:inline" />
            <span className="text-[#320398] font-semibold"> Build. Collaborate. Win. Repeat.</span>
          </span>
        </div>

        {/* Socials */}
        <div className="flex gap-4">
          {/* GitHub */}
          <a
            href="https://github.com/srinivas-batthula/coflow"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#320398] hover:text-[#220268] transition-colors"
            aria-label="GitHub"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.417-.012 2.747 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
            </svg>
          </a>

          {/* Email */}
          <a
            href="mailto:team@hackpilot.dev"
            className="text-[#320398] hover:text-[#220268] transition-colors"
            aria-label="Email"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 2v.01L12 13 4 6.01V6h16zM4 18V8.83l7.12 5.74a1 1 0 001.76 0L20 8.83V18H4z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
