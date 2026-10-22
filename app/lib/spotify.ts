import type {
  PlayOptions,
  SpotifyArtist,
  SpotifyPagingObject,
  SpotifyPlaylist,
  SpotifyPlaylistTrack,
  SpotifyTrack,
} from "./spotify.types";

/**
 * class that makes request to Spotify's API
 */
export class SpotifyClient {
  private getAccessToken: (force?: boolean) => Promise<string | null>;

  constructor(getAccessToken: (force?: boolean) => Promise<string | null>) {
    this.getAccessToken = getAccessToken;
  }

  private request(endpoint: string, token: string, options?: RequestInit) {
    return fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error("No access token");
    }

    let response = await this.request(endpoint, token, options);
    if (response.status === 401) {
      const refreshedToken = await this.getAccessToken(true);
      if (!refreshedToken) throw new Error("No access token");
      response = await this.request(endpoint, refreshedToken, options);
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `Spotify API error: ${response.status} on ${endpoint}${detail ? ` - ${detail}` : ""}`,
      );
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
  async getPlaylists(): Promise<SpotifyPagingObject<SpotifyPlaylist>> {
    return this.fetch("/me/playlists");
  }

  async getPlaylistTracks(
    id: string,
  ): Promise<SpotifyPagingObject<SpotifyPlaylistTrack>> {
    return this.fetch(`/playlists/${id}/tracks`);
  }

  async getTopArtists(): Promise<SpotifyPagingObject<SpotifyArtist>> {
    return this.fetch(
      "/me/top/artists?offset=0&limit=10&time_range=medium_term",
    );
  }

  async getTopTracks(limit = 50): Promise<SpotifyPagingObject<SpotifyTrack>> {
    return this.fetch(
      `/me/top/tracks?offset=0&limit=${limit}&time_range=medium_term`,
    );
  }

  // not in use
  async getArtistDetails(artistId: string): Promise<SpotifyArtist> {
    return this.fetch(`/artists/${artistId}`);
  }

  async getArtistTopTracks(artistId: string): Promise<SpotifyTrack[]> {
    const res = await this.fetch<{ tracks: SpotifyTrack[] }>(
      `/artists/${artistId}/top-tracks?market=US`,
    );
    return res.tracks;
  }

  async transferPlayback(deviceId: string, play = false) {
    return this.fetch("/me/player", {
      method: "PUT",
      body: JSON.stringify({ device_ids: [deviceId], play }),
    });
  }

  async shuffle(state = true, deviceId: string) {
    return this.fetch(
      `/me/player/shuffle?state=${state}&device_id=${deviceId}`,
      { method: "PUT" },
    );
  }

  async play(deviceId: string) {
    return this.fetch(`/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
    });
  }

  async playTrack(deviceId: string, options?: PlayOptions) {
    return this.fetch(`/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      body: options
        ? JSON.stringify({
            ...(options.uris && { uris: options.uris }),
            ...(options.contextUri && { context_uri: options.contextUri }),
            ...(options.offsetUri && { offset: { uri: options.offsetUri } }),
          })
        : undefined,
    });
  }
}
