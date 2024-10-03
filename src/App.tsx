import { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaMusic, FaSadTear, FaSmile, FaSortDown } from "react-icons/fa";
import { toast } from "react-toastify";
import spotifyLogo from "./assets/spotify.png";
import { stringify } from "postcss";

const App = () => {
  const [mood, setMood] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [playlistLink, setPlaylistLink] = useState<string>("");
  const [playlistName, setPlaylistName] = useState<string>("");
  const [SpotifyRedirectUrl, setSpotifyRedirectUrl] = useState<string>("");
  const [Token, setToken] = useState<any>("");
  const [UserId, setUserId] = useState<string>("");
  const [ShowPlaylistDiv, setShowPlaylistDiv] = useState<boolean>(false);
  const [isLoginDiv, setIsLoginDiv] = useState<boolean>(false);
  const [UserName, setUserName] = useState<string>("");

  const authEndpoint = "https://accounts.spotify.com/authorize";
  const clientId = import.meta.env.VITE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_APP_URL;
  const scopes = [
    "playlist-modify-public",
    "user-library-modify",
    "user-top-read",
  ];
  const api_key = import.meta.env.VITE_API_KEY;

  const getTokenFromUrl = () => {
    const tokenInfo = window.location.hash
      .substring(1)
      .split("&")
      .reduce((initial: any, item: any) => {
        let parts = item.split("=");
        initial[parts[0]] = decodeURIComponent(parts[1]);
        return initial;
      }, {});

    const token = tokenInfo.access_token;
    setToken(token);
    return token;
  };

  const getTopArtists = async () => {
    const response = await fetch(
      "https://api.spotify.com/v1/me/top/artists?limit=10",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${
            Token.length > 0 ? Token : getTokenFromUrl()
          }`,
        },
      }
    );

    interface url {
      spotify: string;
    }

    interface artists {
      name: string;
      external_urls: url;
      genres: string[];
    }

    const data = await response.json();
    const outData: artists[] = [];
    data.items.forEach((artist: artists) => {
      let arr: {} | any = {};
      arr["name"] = artist.name;
      arr["spotify_url"] = artist.external_urls.spotify;
      arr["genres"] = artist.genres.join(", ");

      outData.push(arr);
    });
    return outData;
  };

  const getTopTracks = async () => {
    const response = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?limit=10",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${
            Token.length > 0 ? Token : getTokenFromUrl()
          }`,
        },
      }
    );

    const data = await response.json();


    interface songs {
      name: string;
      artists: string[];
    }

    const outData: songs[] = [];
    data.items.forEach((song: songs) => {
      let arr: {} | any = {};
      let artists: string[] = [];

      arr["song_title"] = song.name;

      song.artists.forEach((artist: any) => {
        artists.push(artist.name);
      });

      arr["artist"] = artists.join(', ');

      outData.push(arr);
    });
    return outData;
  };

  const searchSongs = async (keywords: string, playlistName: string) => {
    try {
      setPlaylistName(playlistName);
      let rand = Math.floor(Math.random() * 30);
      let number = rand + 10 > 30 ? rand : 30;

      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${keywords}&type=track&limit=${number}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${
              Token.length > 0 ? Token : getTokenFromUrl()
            }`,
          },
        }
      );
      const data = await response.json();
      let songs = data.tracks.items;

      const createPlaylistResponse = await fetch(
        `https://api.spotify.com/v1/users/${UserId}/playlists`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${
              Token.length > 0 ? Token : getTokenFromUrl()
            }`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: playlistName,
            public: true,
          }),
        }
      );

      const playlistData = await createPlaylistResponse.json();
      const playlistId = playlistData.id;
      // console.log("playlist data: ", playlistData);

      const trackUris = songs.map((song: any) => song.uri);

      fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${
            Token.length > 0 ? Token : getTokenFromUrl()
          }`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: trackUris }),
      });

      // let createPlayListResponseRes = await createPlayListResponse.json();

      setPlaylistLink(playlistData.external_urls.spotify);
      setShowPlaylistDiv(true);
      setLoading(false);
    } catch (error) {
      toast.error("Error creating paylist, you must be logged in.");
      setIsLoginDiv(true);
      setLoading(false);
    }
  };

  const getUserId = async () => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${
            Token.length > 0 ? Token : getTokenFromUrl()
          }`,
        },
      });

      // console.log(await response.json());
      // console.log("place 2: ", Token.length > 0 ? Token : getTokenFromUrl());
      const data = await response.json();
      console.log(data);
      setUserId(data.id);
      setUserName(data.display_name);
    } catch (error) {
      setIsLoginDiv(true);
    }
  };

  useEffect(() => {
    setSpotifyRedirectUrl(
      `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
        "%20"
      )}&response_type=token&show_dialog=true`
    );
  }, [setSpotifyRedirectUrl, setToken, clientId, redirectUri, authEndpoint]);

  useEffect(() => {
    try {
      getTokenFromUrl();
      getUserId();
    } catch (error) {
      setIsLoginDiv(true);
      toast.error("You must be logged in.");
    }
  }, []);

  const handleGeneratePlaylist = async () => {
    try {
      if (navigator.onLine == false) {
        throw new Error("You seem to be offline.");
      }
      setLoading(true);
      // console.log(api_key);


     
      const topArtistResponse = await fetch(
        "https://api.spotify.com/v1/me/top/artists?limit=10",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${
              Token.length > 0 ? Token : getTokenFromUrl()
            }`,
          },
        }
      );
  
      interface url {
        spotify: string;
      }
  
      interface artists {
        name: string;
        external_urls: url;
        genres: string[];
      }
  
      let rawArtists = await topArtistResponse.json();
      let Artists: artists[] = [];
      rawArtists.items.forEach((artist: artists) => {
        let arr: {} | any = {};
        arr["name"] = artist.name;
        arr["spotify_url"] = artist.external_urls.spotify;
        arr["genres"] = artist.genres.join(", ");
  
        Artists.push(arr);
      });

      const topTracksResponse = await fetch(
        "https://api.spotify.com/v1/me/top/tracks?limit=10",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${
              Token.length > 0 ? Token : getTokenFromUrl()
            }`,
          },
        }
      );
  
      let rawTopSongs = await topTracksResponse.json();
  
  
      interface songs {
        name: string;
        artists: string[];
      }
  
      let topSongs: songs[] = [];
      rawTopSongs.items.forEach((song: songs) => {
        let arr: {} | any = {};
        let artists: string[] = [];
  
        arr["song_title"] = song.name;
  
        song.artists.forEach((artist: any) => {
          artists.push(artist.name);
        });
  
        arr["artist"] = artists.join(', ');
  
        topSongs.push(arr);
      });
      

      console.log("artists: ", JSON.stringify(Artists),"songs: ", JSON.stringify(topSongs))
      const genAI = new GoogleGenerativeAI(api_key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze the user's input for mood or feeling, along with their top artists and songs provided, and create the ideal Spotify search query. The query should aim to find songs that align with the user's input, reflecting their mood or specific artist or song preferences. User input: ${mood}. Top artists: ${JSON.stringify(Artists)}. Top songs: ${JSON.stringify(topSongs)}. Return only the keywords for the Spotify search query.`;

      const response = await model.generateContent(prompt);

      const prompt_2 = `a song playlist has been created fro a user based on their moods: ${mood}, suggest a playlist name in just one string.`;
      const response_2 = await model.generateContent(prompt_2);

      let keywords = response.response.text();
      let name = response_2.response.text();
      console.log("keywords: ",  keywords);
      setPlaylistName(name);

      searchSongs(keywords, name);
      // const sentimentMagnitude = data.documentSentiment.magnitude; // The intensity of the sentiment

      // let spotifyKeywords = [];

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
      {(Token == null || isLoginDiv == true) && (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="w-11/12 md:w-1/4 rounded-2xl bg-gray-50 p-5">
            <h1 className="text-gray-900 text-center my-3 text-3xl">
              Login to Moodmix
            </h1>
            <a
              href={SpotifyRedirectUrl}
              className="flex flex-row  items-center gap-x-2 p-3 border border-gray-400 rounded-2xl hover:bg-gray-200"
            >
              <img src={spotifyLogo} alt="spotify-logo" className="w-12 h-12" />
              LOGIN WITH SPOTIFY
            </a>
          </div>
        </div>
      )}
      {ShowPlaylistDiv == true && (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="w-11/12 md:w-1/4 rounded-2xl bg-gray-50 p-5 flex flex-col justify-center items-center">
            <p className="text-gray-900 text-center my-3 text-3xl">
              Your playlist is ready!
            </p>
            {playlistName}
            <a
              href={playlistLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline mt-2 block mx-auto text-center my-2 text-xl"
            >
              <button
                className="bg-blue-500 cursor-pointer px-6 py-2 rounded-xl text-gray-50 hover:bg-blue-600 mx-auto"
                onClick={() => {
                  setShowPlaylistDiv(false);
                }}
              >
                Open playlist
              </button>
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
          <div className="flex flex-row items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-center text-gray-800">
              Moodmix
            </h1>
            <div className="flex flex-col relative px-4 py-3 rounded-2xl bg-indigo-600 cursor-pointer items-center justify-center text-gray-50 text-xl">
              <div className="flex flex-row gap-x-3">
                {UserName}
                <FaSortDown></FaSortDown>
              </div>
            </div>
          </div>
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
        </div>
        <footer className="mt-8 text-gray-600 text-sm text-center">
          <p>Made with ❤️ by Brocode. 🖤🌹</p>
        </footer>
      </div>
    </>
  );
};

export default App;
