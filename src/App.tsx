import { useState } from "react";
import { FaMusic, FaSadTear, FaSmile } from "react-icons/fa"; // Importing icons

const App = () => {
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [playlistLink, setPlaylistLink] = useState("");

  const handleGeneratePlaylist = () => {
    setLoading(true);
    // Simulate playlist generation delay
    setTimeout(() => {
      setPlaylistLink("https://open.spotify.com/playlist/sample-link");
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 p-6 relative">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="loader"></div>
        </div>
      )}
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full z-10">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
          Moodmix
        </h1>
        <p className="text-gray-600 text-center mb-4">
          Describe your mood and let AI generate the perfect playlist for you.
        </p>
        <div className="flex justify-center mb-4">
          <FaSmile className="text-3xl mx-2 text-yellow-500" />
          <FaSadTear className="text-3xl mx-2 text-blue-500" />
          <FaMusic className="text-3xl mx-2 text-purple-500" />
        </div>
        <textarea
          className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-700"
          placeholder="How are you feeling today?"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        />
        <button
          className={`w-full mt-4 py-3 text-white rounded-lg transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
          disabled={loading || !mood}
          onClick={handleGeneratePlaylist}
        >
          {loading ? "Generating Playlist..." : "Create Playlist"}
        </button>

        {playlistLink && (
          <div className="mt-6 text-center">
            <p className="text-gray-700">Your playlist is ready!</p>
            <a
              href={playlistLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline mt-2 block"
            >
              Listen to your Spotify Playlist
            </a>
          </div>
        )}
      </div>
      <footer className="mt-8 text-gray-600 text-sm text-center">
        <p>Made with ❤️ by Moodify Team</p>
      </footer>

    
    </div>
  );
};

export default App;
