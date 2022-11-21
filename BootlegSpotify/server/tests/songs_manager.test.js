const path = require("path");
const fs = require("fs");
const { SongsManager } = require("../managers/songs_manager");
const songs = require("../data/songs.json").songs;

async function restoreSongs () {
  const filePath = path.join(__dirname, "/songs_test.json");
  await fs.promises.writeFile(filePath, JSON.stringify({ songs }));
}

describe("Songs manager", () => {
  let songsManager;
  const TEST_JSON_PATH = path.join(__dirname, "/songs_test.json");

  beforeEach(() => {
    songsManager = new SongsManager();
    songsManager.JSON_PATH = TEST_JSON_PATH;
  });

  afterEach(async () => {
    await restoreSongs();
  });

  it("getAllSongs should return all songs", async () => {
    const allSongs = await songsManager.getAllSongs();
    expect(allSongs).toEqual(songs);
  });

  it("getSongById should return a song based on its id", async () => {
    const song = await songsManager.getSongById(0);
    expect(song).toEqual(songs.find((song) => song.id === 0));
  });

  it("updateSongLike should update the like of a song", async () => {
    await songsManager.updateSongLike(0);
    const song = await songsManager.getSongById(0);
    expect(song.liked).toEqual(true);
  });

  it("updateSongLike should update the correct JSON file", async () => {
    const spy = jest.spyOn(songsManager.fileSystemManager, "writeToJsonFile").mockImplementation(() => {});
    await songsManager.updateSongLike(0);
    expect(spy).toBeCalled();
    expect(spy.mock.calls[0][0]).toEqual(songsManager.JSON_PATH);
  });
});
