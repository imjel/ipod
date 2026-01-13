/**
 * class that makes request to Spotify's API
 */
export class SpotifyClient {
  private getAccessToken: () => Promise<string | null>;

  constructor(getAccessToken: () => Promise<string | null>) {
    this.getAccessToken = getAccessToken;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = await this.getAccessToken();

    if (!token) {
      throw new Error("No access token");
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    // 204 errors for no content on music player actions
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // get user information
  async getUser() {
    return this.fetch("/me");
  }

  // playlists
  async getPlaylists() {
    return this.fetch("/me/playlists");
  }

  async getPlaylistTracks(id: string) {
    return this.fetch(`/playlists/${id}/tracks`);
  }

  async getTopArtists() {
    return this.fetch("/me/top/artists?time_range=medium_term");
  }
}
