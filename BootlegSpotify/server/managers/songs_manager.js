const { FileSystemManager } = require("./file_system_manager");
const path = require("path");

class SongsManager {
  constructor () {
    this.JSON_PATH = path.join(__dirname + "../../data/songs.json");
    this.fileSystemManager = new FileSystemManager();
  }

  /**
   * Retourne la liste de toutes les chansons
   * @returns {Promise<Array>}
   */
  async getAllSongs () {
    const fileBuffer = await this.fileSystemManager.readFile(this.JSON_PATH);
    return JSON.parse(fileBuffer).songs;
  }

  async getSongById (id) {
    const songs = await this.getAllSongs();
    return songs.find((item) => item.id === id);
  }

  async updateSongLike (id) {
    const song = await this.getSongById(id);
    song.liked = !song.liked;
    let songs = await this.getAllSongs();
    songs = songs.map((item) => item.id === id ? song : item);
    await this.fileSystemManager.writeToJsonFile(this.JSON_PATH, JSON.stringify({ songs }));
    return song.liked;
  }
}

module.exports = { SongsManager };
