import { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaMusic, FaSadTear, FaSmile } from "react-icons/fa"; // Importing icons
import { toast } from "react-toastify";
import spotifyLogo from "./assets/spotify.png";

const App = () => {
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [playlistLink, setPlaylistLink] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [SpotifyRedirectUrl, setSpotifyRedirectUrl] = useState("");
  const [Token, setToken] = useState<string | null>("");
  const [UserId, setUserId] = useState<any>("");

  const authEndpoint = "https://accounts.spotify.com/authorize";
  const clientId = import.meta.env.VITE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_APP_URL;
  const scopes = [
    "user-read-currently-playing",
    "user-read-playback-state",
    "playlist-read-private",
    "playlist-modify-private",
    "playlist-modify-public",
    "user-library-read",
    "user-library-modify",
  ];

  const getTokenFromUrl = () => {
    const tokenInfo = window.location.hash
      .substring(1)
      .split("&")
      .reduce((initial:any, item:any) => {
        let parts = item.split("=");
        initial[parts[0]] = decodeURIComponent(parts[1]);
        return initial;
      }, {});

    const token = tokenInfo.access_token;
      setToken(token); 
      console.log(token);
};

  const searchSongs = async (keywords:string) => {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${keywords}&type=track`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    const data = await response.json();
    let songs = data.tracks.items;

    const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${UserId}/playlists`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: playlistName,
        public: true,
      }),
    });

    const playlistData = await createPlaylistResponse.json();
    const playlistId = playlistData.id;

    // Now add tracks to the newly created playlist
    const trackUris = songs.map((song:any) => song.uri); // Get the URIs of the songs

    let createPlayListResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: trackUris }),
    });

    console.log(await createPlayListResponse.json());

    setLoading(false);
  }

  const getUserId = async () => {
    const response = await fetch('https://api.spotify.com/v1/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    console.log("place 2: ", Token);
    const data = await response.json();
    setUserId(data.id);
  }


  useEffect(() => {
    setSpotifyRedirectUrl(
      `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
        "%20"
      )}&response_type=token&show_dialog=true`
    );
    setToken(localStorage.getItem("token"));
  }, [setSpotifyRedirectUrl, setToken, clientId, redirectUri, authEndpoint]);

  useEffect(() => {
    if(localStorage.getItem("token") == null){
      try {
        getTokenFromUrl();
        getUserId();
      } catch (error) {
        
      }
    }
  }, []);

  const handleGeneratePlaylist = async () => {
    try {
      if (navigator.onLine == false) {
        throw new Error("You seem to be offline.");
      }
      setLoading(true);

      const api_key = import.meta.env.VITE_API_KEY;

      const genAI = new GoogleGenerativeAI(api_key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Extract the user's mood, artist names, and song titles into one short string: test:[mood, artist, song], User Input: ${mood}. answer must be not be too long and only contain keywords, recommend a popular artist and song title if not provided`;

      const response = await model.generateContent(prompt);
      const prompt_2 = `a song playlist has been created fro a user based on their moods: ${mood}, suggest a playlist name in just one string.`;

      const response_2 = await model.generateContent(prompt_2);

      let keywords = response.response.text();
      let playlistName = response_2.response.text();
      console.log(keywords, playlistName);
      setPlaylistName(playlistName);

      searchSongs(keywords);
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
    } catch (error: any) {
      toast.error(error);
    }
  };

  return (
    <>
      {Token == null && (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="w-11/12 md:w-1/4 rounded-2xl bg-gray-50 p-5">
            <h1 className="text-gray-900 text-center my-3 text-3xl">
              Login to Moodmix
            </h1>
            <a
              href={SpotifyRedirectUrl}
              className="flex flex-row  items-center gap-x-2 p-3 border border-gray-400 rounded-2xl hover:bg-gray-200"
              target="_blank"
            >
              <img src={spotifyLogo} alt="spotify-logo" className="w-12 h-12" />
              LOGIN WITH SPOTIFY
            </a>
          </div>
        </div>
      )}
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
    </>
  );
};

export default App;
