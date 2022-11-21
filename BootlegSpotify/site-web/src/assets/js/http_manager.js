import { SERVER_URL } from "./consts.js";

export const HTTPInterface = {
  SERVER_URL: `${SERVER_URL}/api`,

  GET: async function (endpoint) {
    const response = await fetch(`${this.SERVER_URL}/${endpoint}`);
    return await response.json();
  },

  POST: async function (endpoint, data) {
    const response = await fetch(`${this.SERVER_URL}/${endpoint}`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "content-type": "application/json",
      },
    });

    return await response.json();
  },

  DELETE: async function (endpoint) {
    const response = await fetch(`${this.SERVER_URL}/${endpoint}`, {
      method: "DELETE",
    });
    return response.status;
  },

  PATCH: async function (endpoint) {
    const response = await fetch(`${this.SERVER_URL}/${endpoint}`, {
      method: "PATCH",
    });
    return response.status;
  },

  PUT: async function (endpoint, data) {
    const response = await fetch(`${this.SERVER_URL}/${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "content-type": "application/json",
      },
    });
    return response.status;
  },
};

export default class HTTPManager {
  constructor () {
    this.songs = {};
    this.playlists = {};
    this.songsBaseURL = "songs";
    this.songFileBaseURL = "player";
    this.playlistBaseURL = "playlists";
    this.songPlayer = "player";
    this.searchBaseURL = "search";
  }

  async fetchAllSongs () {
    return await HTTPInterface.GET(this.songsBaseURL);
  }

  async fetchAllPlaylists () {
    return await HTTPInterface.GET(this.playlistBaseURL);
  }

  async fetchSong (id) {
    return await HTTPInterface.GET(`${this.songsBaseURL}/${id}`);
  }

  /**
   * Récupère et retourne un fichier de musique (Blob) du serveur en fonction de son id
   * @param {number} id identifiant de la chanson
   * @returns {Promise} un URL qui représente le fichier de musique
   */
  async getSongURLFromId (id) {
    const songBlob = await fetch(`${HTTPInterface.SERVER_URL}/${this.songsBaseURL}/${this.songFileBaseURL}/${id}`);
    const url = URL.createObjectURL(await songBlob.blob());
    return url;
  }

  async search (query, exact) {
    return await HTTPInterface.GET(`${this.searchBaseURL}?search_query=${query}&exact=${exact}`);
  }

  /**
   * @returns {Promise} Liste des chansons
   */
  async getAllSongs () {
    const songsPromises = new Promise((resolve, reject) => {
      try {
        const songs = this.fetchAllSongs();
        resolve(songs);
      } catch (err) {
        reject("Échec lors de la requête GET /api/songs");
      }
    });

    const songsReceived = Promise.resolve(songsPromises);
    return songsReceived;
  }

  /**
   * @returns {Promise} Liste des playlists
   */
  async getAllPlaylists () {
    const playlistsPromises = new Promise((resolve, reject) => {
      try {
        const playlists = this.fetchAllPlaylists();
        resolve(playlists);
      } catch (err) {
        reject("Échec lors de la requête GET /api/playlists");
      }
    });

    const playlistsReceived = Promise.resolve(playlistsPromises);
    return playlistsReceived;
  }

  async getPlaylistById (id) {
    try {
      const playlist = await HTTPInterface.GET(`${this.playlistBaseURL}/${id}`);
      return playlist;
    } catch (err) {
      window.alert(err);
    }
  }

  async addNewPlaylist (playlist) {
    try {
      await Promise.resolve(await HTTPInterface.POST(`${this.playlistBaseURL}`, playlist));
    } catch (err) {
      window.alert("An error has occured while adding a new playlist", err);
    }
  }

  async updatePlaylist (playlist) {
    try {
      await Promise.resolve(await HTTPInterface.PUT(`${this.playlistBaseURL}/${playlist.id}`, playlist));
    } catch (err) {
      window.alert("An error has occured while adding a new playlist", err);
    }
  }

  async deletePlaylist (id) {
    try {
      await Promise.resolve(await HTTPInterface.DELETE(`${this.playlistBaseURL}/${id}`));
    } catch (err) {
      window.alert("An error has occured while deleting a playlist", err);
    }
  }

  /**
   * Modifie l'état aimé d'une chanson
   * @param {number} id identifiant de la chanson à modifier
   */
  async updateSong (id) {
    try {
      await HTTPInterface.PATCH(`${this.songsBaseURL}/${id}/like`);
    } catch (err) {
      window.alert("An error has occured while trying to change a song status", err);
    }
  }
}
