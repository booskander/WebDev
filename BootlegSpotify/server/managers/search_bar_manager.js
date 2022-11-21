
class SearchBarManager {
  constructor (songsManager, playlistManager) {
    this.songsManager = songsManager;
    this.playlistManager = playlistManager;
  }

  async search (searchParameters, exact) {
    const songs = await this.songsManager.getAllSongs();
    const playlists = await this.playlistManager.getAllPlaylists();
    const filteredPlaylists = playlists.filter((playlist) => {
      return this.searchInFields([playlist.description, playlist.name], searchParameters, exact);
    });
    const filteredSongs = songs.filter((song) => {
      return this.searchInFields([song.name, song.artist, song.genre], searchParameters, exact);
    });
    return { "songs": filteredSongs, "playlists": filteredPlaylists };
  }

  includesSubstring (originalString, substring, exactMatch) {
    const origin = exactMatch ? originalString : originalString.toLowerCase();
    const search = exactMatch ? substring : substring.toLowerCase();
    return origin.includes(search);
  }

  searchInFields (searchFields, searchValue, exactMatch) {
    return searchFields.find((field) => this.includesSubstring(field, searchValue, exactMatch));
  }
}

module.exports = { SearchBarManager };
