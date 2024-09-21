import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaMusic, FaSadTear, FaSmile } from "react-icons/fa"; // Importing icons

const App = () => {
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [playlistLink, setPlaylistLink] = useState("");

  const handleGeneratePlaylist = async () => {
    setLoading(true);

    const api_key = import.meta.env.VITE_API_KEY;
    const spotify_key = import.meta.env.VITE_SPOTIFY_KEY;


    const genAI = new GoogleGenerativeAI(api_key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Extract the user's mood, artist names, and song titles into one short string: test:[mood, artist, song], User Input: ${mood}. answer must be not be too long and only contain keywords, recommend a popular artist and song title if not provided`;

    const response = await model.generateContent(prompt);
    const prompt_2 = `a song playlist has been created fro a user based on their moods: ${mood}, suggest a playlist name in just one string.`;

    const response_2 = await model.generateContent(prompt_2);

    let keywords = response.response.text();
    let playlistName = response_2.response.text();
    console.log(keywords, playlistName);
  
    
    setLoading(false);

    const getUserData = async () => {
          const response = await fetch('https://api.spotify.com/v1/me', {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${spotify_key}`
              }
          });

          if(response.ok){
            let res = await response.json();
            console.log(res)
          }
      }
      getUserData();
    // const sentimentScore = data.documentSentiment.score;
    // const sentimentMagnitude = data.documentSentiment.magnitude; // The intensity of the sentiment

    // // Initialize an empty array to hold Spotify-friendly search keywords
    // let spotifyKeywords = [];

    // // Map moods to Spotify-friendly terms
    // if (sentimentScore > 0.5) {
    //   spotifyKeywords.push('happy', 'upbeat', 'energetic');
    // } else if (sentimentScore < 0) {
    //   spotifyKeywords.push('sad', 'melancholy', 'low-energy');
    // } else {
    //   spotifyKeywords.push('neutral', 'calm');
    // }

    // // Additional logic for handling more nuanced emotions
    // if (sentimentMagnitude > 2.0) {
    //   spotifyKeywords.push('intense', 'powerful');
    // } else if (sentimentMagnitude < 0.5) {
    //   spotifyKeywords.push('chill', 'relaxing');
    // }

    // // Add custom categories based on certain keywords in the description
    // if (mood.toLowerCase().includes('anxious')) {
    //   spotifyKeywords.push('ambient', 'calm');
    // }
    // if (mood.toLowerCase().includes('energetic')) {
    //   spotifyKeywords.push('workout', 'upbeat');
    // }
    // if (mood.toLowerCase().includes('stressed')) {
    //   spotifyKeywords.push('calming', 'focus');
    // }

    // console.log(`Spotify Search Keywords: ${spotifyKeywords.join(', ')}`);



    // setTimeout(() => {
    //   setPlaylistLink("https://open.spotify.com/playlist/sample-link");
    //   setLoading(false);
    // }, 2000);
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
