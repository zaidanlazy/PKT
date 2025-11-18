export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {/* IMAGE */}
      <img
        src="https://cdn-icons-png.flaticon.com/512/5231/5231019.png"
        alt="Astronaut Illustration"
        className="w-56 mb-6"
      />

      {/* BADGE */}
      <div className="px-4 py-1 bg-red-100 text-red-600 rounded-full text-sm flex items-center gap-2 mb-4">
        <span>⚠️</span>
        <span>404 Error</span>
      </div>

      {/* TITLE */}
      <h1 className="text-3xl font-semibold text-gray-800">Page not Found</h1>

      {/* SUBTEXT */}
      <p className="text-gray-500 mt-2 text-center max-w-md">
        Sorry, the page you are looking for does not exist
      </p>

      {/* SEARCH BAR */}
      <div className="mt-6 flex w-full max-w-md">
        <div className="flex items-center gap-2 w-full">
          <div className="flex items-center border rounded-lg px-3 py-2 w-full bg-white shadow-sm">
            <span className="text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search"
              className="w-full outline-none ml-2"
            />
          </div>

          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
