const { SearchBarManager } = require("../managers/search_bar_manager");
const { SongsManager } = require("../managers/songs_manager");
const { PlaylistManager } = require("../managers/playlist_manager");

describe("Songs manager", () => {
  let searchBarManager;

  beforeEach(() => {
    searchBarManager = new SearchBarManager(new SongsManager(), new PlaylistManager());
  });

  it("includesSubstring should return true if substring is in original string without exactMatch", () => {
    const originalString = "Test";
    const subString = "es";
    expect(searchBarManager.includesSubstring(originalString, subString, false)).toBeTruthy();
  });

  it("includesSubstring should return false if substring is not in original string without exactMatch", () => {
    const originalString = "Test";
    const subString = "abc";
    expect(searchBarManager.includesSubstring(originalString, subString, false)).toBeFalsy();
  });

  it("includesSubstring should return true if substring is in original string with exactMatch", () => {
    const originalString = "Test";
    const subString = "Te";
    expect(searchBarManager.includesSubstring(originalString, subString, true)).toBeTruthy();
  });

  it("includesSubstring should return false if substring is not in original string with exactMatch", () => {
    const originalString = "Test";
    const subString = "te";
    expect(searchBarManager.includesSubstring(originalString, subString, true)).toBeFalsy();
  });

  it("searchInFields should return true if atleast one field contains the string", () => {
    const fields = ["Bounce", "Coma-Media", "Electronic"];
    const subString = "co";
    expect(searchBarManager.searchInFields(fields, subString, false)).toBeTruthy();
  });

  it("searchInFields should return false if none of the fields contains the string", () => {
    const fields = ["Bounce", "Coma-Media", "Electronic"];
    const subString = "def";
    expect(searchBarManager.searchInFields(fields, subString, false)).toBeFalsy();
  });

  it("searchInFields should call includesSubstring", () => {
    const fields = ["Bounce", "Coma-Media", "Electronic"];
    const spy = jest.spyOn(searchBarManager, "includesSubstring").mockImplementation(() => true);
    searchBarManager.searchInFields(fields, "allo", false);
    expect(spy).toHaveBeenCalled();
  });

  it("search should call searchInFields, getAllPlaylists and getAllSongs for playlists and songs", async () => {
    const searchSpy = jest.spyOn(searchBarManager, "searchInFields").mockImplementation(() => true);
    const searchSources = {
      playlists: [
        { name: "p1", description: "d1" },
        { name: "p2", description: "d2" },
      ],
      songs: [{ name: "Bounce", artist: "Coma-Media", genre: "Electronic" }],
    };
    const playlistsSpy = jest
      .spyOn(searchBarManager.playlistManager, "getAllPlaylists")
      .mockImplementation(() => searchSources.playlists);
    const songSpy = jest
      .spyOn(searchBarManager.songsManager, "getAllSongs")
      .mockImplementation(() => searchSources.songs);

    const expectedSearchCalls = searchSources.playlists.length + searchSources.songs.length;
    const searchInput = "Co";

    await searchBarManager.search(searchInput, false);

    expect(searchSpy).toHaveBeenCalled();
    expect(playlistsSpy).toHaveBeenCalled();
    expect(songSpy).toHaveBeenCalled();
    expect(searchSpy).toHaveBeenCalledTimes(expectedSearchCalls);
  });

  it("search should return an object containing filtered playlists and songs", async () => {
    const searchSources = {
      playlists: [
        { name: "p1", description: "stringWithCo" },
        { name: "p2", description: "d2" },
      ],
      songs: [{ name: "Bounce", artist: "Coma-Media", genre: "Electronic" }],
    };
    jest.spyOn(searchBarManager.playlistManager, "getAllPlaylists").mockImplementation(() => searchSources.playlists);
    jest.spyOn(searchBarManager.songsManager, "getAllSongs").mockImplementation(() => searchSources.songs);

    const searchInput = "Co";

    const res = await searchBarManager.search(searchInput, false);
    expect(res).toEqual({ playlists: [searchSources.playlists[0]], songs: searchSources.songs });
  });

  it("search should return an object containing only an exact math of playlists and songs if exact = true", async () => {
    const searchSources = {
      playlists: [
        { name: "p1", description: "stringWithco" },
        { name: "p2", description: "d2" },
      ],
      songs: [{ name: "Bounce", artist: "Coma-Media", genre: "Electronic" }],
    };
    jest.spyOn(searchBarManager.playlistManager, "getAllPlaylists").mockImplementation(() => searchSources.playlists);
    jest.spyOn(searchBarManager.songsManager, "getAllSongs").mockImplementation(() => searchSources.songs);

    const searchInput = "Co";

    const res = await searchBarManager.search(searchInput, true);
    expect(res).toEqual({ playlists: [], songs: searchSources.songs });
  });
});
