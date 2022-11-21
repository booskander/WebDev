const { FileSystemManager } = require("./file_system_manager");
const path = require("path");
const { randomUUID } = require("crypto");
const fs = require("fs");

class PlaylistManager {
  constructor () {
    this.JSON_PATH = path.join(__dirname + "../../data/playlists.json");
    this.fileSystemManager = new FileSystemManager();
  }

  /**
   * Retourne toutes les playlists disponibles
   * @returns {Promise<Array>} la liste de toutes les playlists
   */
  async getAllPlaylists () {
    const fileBuffer = await this.fileSystemManager.readFile(this.JSON_PATH);
    return JSON.parse(fileBuffer).playlists;
  }

  async getPlaylistById (id) {
    const playlists = await this.getAllPlaylists();
    return playlists.find(playlist => playlist.id === id);
  }

  async addPlaylist (playlist) {
    const playlists = await this.getAllPlaylists();
    playlist.id = randomUUID();
    await this.savePlaylistThumbnail(playlist);
    playlists.push(playlist);
    await this.fileSystemManager.writeToJsonFile(this.JSON_PATH, JSON.stringify({ playlists }));
    return playlist;
  }

  async updatePlaylist (playlist) {
    let playlists = await this.getAllPlaylists();
    await this.savePlaylistThumbnail(playlist);
    playlists = playlists.map(item => item.id === playlist.id ? playlist : item);
    await this.fileSystemManager.writeToJsonFile(this.JSON_PATH, JSON.stringify({ playlists }));
  }

  /**
   * Extrait le type d'image d'une notation base64 d'une image
   * @param {string} picture image représentée sous le format base64
   * @returns {string} le type de l'image
   */
  async chooseProperEncoding (picture) {
    if (picture.startsWith("data:image/jpeg;base64,")) {
      return "jpeg";
    } else if (picture.startsWith("data:image/png;base64,")) {
      return "png";
    } else if (picture.startsWith("data:image/bmp;base64,")) {
      return "bmp";
    } else if (picture.startsWith("data:image/jpg;base64,")) {
      return "jpg";
    } else {
      throw new Error("Invalid image format");
    }
  }

  /**
   * @param {string} id identifiant de la playlist
   * @returns {Promise<boolean>} true si la playlist a été supprimée, false sinon
   */
  async deletePlaylist (id) {
    const allPlaylists = await this.getAllPlaylists();
    const playlistToDelete = allPlaylists.find((playlist) => playlist.id === id);
    if (playlistToDelete) {
      const playlists = allPlaylists.filter((playlist) => playlist.id !== id);
      const playlistToSave = JSON.stringify({ playlists }, null, 2);
      await this.fileSystemManager.writeToJsonFile(this.JSON_PATH, playlistToSave);
      await this.deletePlaylistThumbnail(playlistToDelete.thumbnail);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Supprime un fichier sur disque
   * @param {string} filePath chemin vers le fichier à supprimer
   * @returns {Promise<void>} une promesse avec 'undefined' en cas de réussite
   */
  async deletePlaylistThumbnail (filePath) {
    return fs.promises.unlink(filePath);
  }

  /**
   * Sauvegarde l'image de prévisualisation d'une playlist sur disque
   * @param {Object} playlist playlist pour laquelle sauvegarder l'image
   */
  async savePlaylistThumbnail (playlist) {
    const fileFormat = await this.chooseProperEncoding(playlist.thumbnail);
    const thumbnailData = playlist.thumbnail.replace(`data:image/${fileFormat};base64,`, "");
    const thumbnailFileName = `assets/img/${playlist.id}.${fileFormat}`;
    const filePath = path.join(__dirname + `../../assets/img/${playlist.id}.${fileFormat}`);
    await fs.promises.writeFile(filePath, thumbnailData, { encoding: "base64" });
    playlist.thumbnail = thumbnailFileName;
  }
}

module.exports = { PlaylistManager };
