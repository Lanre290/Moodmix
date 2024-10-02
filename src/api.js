export async function getTopTracks(){
    const response = await fetch(
        'https://api.spotify.com/v1/me/top/tracks',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
          },
        }
      );
      
      const data = await response.json();

      return data;
}


export async function getTopArtists(){
    const response = await fetch(
        'https://api.spotify.com/v1/me/top/artists',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
          },
        }
      );
      
      const data = await response.json();

      return data;
}