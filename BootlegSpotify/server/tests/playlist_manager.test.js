const path = require("path");
const fs = require("fs");
const { PlaylistManager } = require("../managers/playlist_manager");
const playlists = require("../data/playlists.json").playlists;

async function restorePlaylists () {
  const filePath = path.join(__dirname, "/playlists_test.json");
  await fs.promises.writeFile(filePath, JSON.stringify({ playlists }));
}

describe("Playlist manager", () => {
  let playlistManager;
  const TEST_JSON_PATH = path.join(__dirname, "/playlists_test.json");

  beforeEach(() => {
    playlistManager = new PlaylistManager();
    playlistManager.JSON_PATH = TEST_JSON_PATH;
  });

  afterEach(async () => {
    await restorePlaylists();
  });

  it("getAllPlaylists should return all playlists", async () => {
    const allPlaylists = await playlistManager.getAllPlaylists();
    expect(allPlaylists).toEqual(playlists);
  });

  it("getPlaylistById should return a specific playlist by it's id", async () => {
    const playlist = await playlistManager.getPlaylistById("0");
    expect(playlist).toEqual(playlists[0]);
  });

  it("getPlaylistById should return undefined if playlist not found", async () => {
    const playlist = await playlistManager.getPlaylistById("123456789");
    expect(playlist).toBeUndefined();
  });

  it("addPlaylist should add a playlist", async () => {
    jest.spyOn(playlistManager, "chooseProperEncoding").mockImplementation(() => {
      return Promise.resolve("jpeg");
    });
    jest.spyOn(playlistManager, "savePlaylistThumbnail").mockImplementation(() => {
      return Promise.resolve();
    });
    const newPlaylist = {
      id: "123456789",
      name: "Test Playlist",
      description: "Updated Description",
      thumbnail: "Updated Thumbnail",
      songs: [{ id: 0 }],
    };
    await playlistManager.addPlaylist(newPlaylist);
    const allPlaylists = await playlistManager.getAllPlaylists();
    expect(allPlaylists).toContainEqual(newPlaylist);
  });

  it("updatePlaylist should update a playlist", async () => {
    jest.spyOn(playlistManager, "chooseProperEncoding").mockImplementation(() => {
      return Promise.resolve("jpeg");
    });
    jest.spyOn(playlistManager, "savePlaylistThumbnail").mockImplementation(() => {
      return Promise.resolve();
    });
    const updatedPlaylist = {
      id: "0",
      name: "Updated Playlist",
      description: "Updated Description",
      thumbnail: "Updated Thumbnail",
      songs: [{ id: 0 }],
    };
    await playlistManager.updatePlaylist(updatedPlaylist);
    const allPlaylists = await playlistManager.getAllPlaylists();
    expect(allPlaylists).toContainEqual(updatedPlaylist);
  });

  it("deletePlaylist should delete a playlist", async () => {
    jest.spyOn(playlistManager, "deletePlaylistThumbnail").mockImplementation(() => {
      return Promise.resolve();
    });
    await playlistManager.deletePlaylist("0");
    const allPlaylists = await playlistManager.getAllPlaylists();
    expect(allPlaylists).not.toContainEqual(playlists[0]);
  });

  it("deletePlaylist should not delete any playlist if id not found", async () => {
    await playlistManager.deletePlaylist("123456789");
    const allPlaylists = await playlistManager.getAllPlaylists();
    expect(allPlaylists).toEqual(playlists);
  });

  it("deletePlaylistThumbnail should call unlink from fs module", async () => {
    const spy = jest.spyOn(fs.promises, "unlink").mockImplementation(() => {});
    await playlistManager.deletePlaylistThumbnail("testPath");
    expect(spy).toBeCalled();
  });

  it("chooseProperEncoding should choose the proper encoding (jpeg)", async () => {
    const encoding = await playlistManager.chooseProperEncoding("data:image/jpeg;base64,");
    expect(encoding).toEqual("jpeg");
  });

  it("chooseProperEncoding should choose the proper encoding (png)", async () => {
    const encoding = await playlistManager.chooseProperEncoding("data:image/png;base64,");
    expect(encoding).toEqual("png");
  });

  it("chooseProperEncoding should choose the proper encoding (bmp)", async () => {
    const encoding = await playlistManager.chooseProperEncoding("data:image/bmp;base64,");
    expect(encoding).toEqual("bmp");
  });

  it("chooseProperEncoding should choose the proper encoding (jpg)", async () => {
    const encoding = await playlistManager.chooseProperEncoding("data:image/jpg;base64,");
    expect(encoding).toEqual("jpg");
  });

  it("chooseProperEncoding should return an error for non supported picture format", async () => {
    try {
      await playlistManager.chooseProperEncoding("data:image/gif;base64,");
    } catch (error) {
      expect(error).toEqual(new Error("Invalid image format"));
    }
  });

  it("savePlaylistThumbnail should save the thumbnail", async () => {
    const playlist = { id: 123, thumbnail: "test.png" };
    jest.spyOn(playlistManager, "chooseProperEncoding").mockImplementation(() => "png");
    const fsSpy = jest.spyOn(fs.promises, "writeFile").mockImplementation(() => {});
    const fileFormat = "png";
    const filePath = path.join(__dirname + `../../assets/img/${playlist.id}.${fileFormat}`);
    const thumbnailData = playlist.thumbnail.replace(`data:image/${fileFormat};base64,`, "");
    await playlistManager.savePlaylistThumbnail(playlist);
    expect(fsSpy).toBeCalled();
    expect(fsSpy).toBeCalledWith(filePath, thumbnailData, { encoding: "base64" });
  });
});
