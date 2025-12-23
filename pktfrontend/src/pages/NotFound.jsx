export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f1e8] relative overflow-hidden">
      {/* Background texture pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle, #d4c5a9 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>

      {/* Decorative elements */}
      <div className="absolute top-3    2 right-48 w-20 h-20 rounded-full border-4 border-black"></div>
      <div className="absolute bottom-48 left-32 w-16 h-16 rounded-full border-4 border-black"></div>
      <div className="absolute top-52 left-96 text-6xl font-bold">×</div>
      <div className="absolute bottom-32 right-56 text-6xl font-bold">×</div>
      <div className="absolute top-64 right-72 text-3xl">°</div>
      <div className="absolute top-48 left-72 text-3xl">×</div>

      {/* Left wire illustration */}
      <div className="absolute left-0 top-0 h-full w-64">
        <svg viewBox="0 0 200 800" className="w-full h-full" fill="none" stroke="black" strokeWidth="3">
          <path d="M 0 0 Q 100 100, 100 200 Q 100 300, 50 400 Q 0 500, 100 600 Q 200 700, 100 800" strokeLinecap="round"/>
        </svg>

        {/* Disconnected plug */}
        <div className="absolute left-12 top-96 transform -translate-y-1/2">
          <div className="relative">
            {/* Plug rays */}
            <div className="absolute -left-6 top-1/2 transform -translate-y-1/2">
              <div className="w-3 h-0.5 bg-black transform -rotate-45 origin-right mb-1"></div>
              <div className="w-4 h-0.5 bg-black"></div>
              <div className="w-3 h-0.5 bg-black transform rotate-45 origin-right mt-1"></div>
            </div>
            {/* Plug body */}
            <div className="w-12 h-12 bg-black rounded-lg relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-2">
                <div className="w-2 h-6 bg-[#f5f1e8] rounded"></div>
                <div className="w-2 h-6 bg-[#f5f1e8] rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        {/* 404 Text with decorative elements */}
        <div className="relative inline-block mb-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl font-bold">×</span>
            <h1 className="text-9xl font-bold tracking-tight">404</h1>
            <span className="text-3xl">°</span>
          </div>
        </div>

        {/* Page Not Found */}
        <h2 className="text-5xl font-serif mb-6">Page Not Found</h2>

        {/* Description */}
        <p className="text-lg mb-2 text-gray-700">Halaman yang anda cari tidak di temukan </p>
        <p className="text-lg mb-8 text-gray-700">Silakan kembali ke halaman utama</p>


      </div>
    </div>
  );
}
