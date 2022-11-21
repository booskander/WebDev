import HTTPManager, { HTTPInterface } from "../src/assets/js/http_manager.js";
import { jest } from "@jest/globals";

describe("HTTPManager tests", () => {
  const assignMock = jest.fn();
  const clearHTML = () => (document.body.innerHTML = "");
  window.location = { assign: assignMock };
  let httpManager;

  beforeEach(() => {
    httpManager = new HTTPManager();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    assignMock.mockClear();
    clearHTML();
  });

  it("fetchAllSongs should send a GET request and return a song array", async () => {
    const songs = [{ id: 0 }];
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ songs }) }));
    const spy = jest.spyOn(HTTPInterface, "GET");
    const res = await httpManager.fetchAllSongs();
    expect(res).toEqual({ songs });
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(`${httpManager.songsBaseURL}`);
  });

  it("fetchAllPlaylists should send a GET request and return a playlist array", async () => {
    const playlists = [{ id: 0 }];
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ playlists }) }));
    const spy = jest.spyOn(HTTPInterface, "GET");
    const res = await httpManager.fetchAllPlaylists();
    expect(res).toEqual({ playlists });
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(`${httpManager.playlistBaseURL}`);
  });

  it("fetchSong should send a GET request and return a song ", async () => {
    const song = { id: 0 };
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ song }) }));
    const id = 1;
    const spy = jest.spyOn(HTTPInterface, "GET");
    const res = await httpManager.fetchSong(id);
    expect(res).toEqual({ song });
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(`${httpManager.songsBaseURL}/${id}`);
  });

  it("getSongURLFromId should send a GET request and return a song ", async () => {
    global.fetch = jest.fn(() => Promise.resolve({ blob: () => Promise.resolve(new Blob()) }));
    const spy = jest.spyOn(global, "fetch");
    global.URL.createObjectURL = jest.fn();
    const id = 1;
    await httpManager.getSongURLFromId(id);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(
      `${HTTPInterface.SERVER_URL}/${httpManager.songsBaseURL}/${httpManager.songFileBaseURL}/${id}`
    );
  });

  it("search should send a GET request and return an object with playlist and songs ", async () => {
    const searchResult = { playlists: [], songs: [] };
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ searchResult }) }));
    const query = "test";
    const exact = false;
    const spy = jest.spyOn(HTTPInterface, "GET");
    const res = await httpManager.search(query, exact);
    expect(res).toEqual({ searchResult });
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(`${httpManager.searchBaseURL}?search_query=${query}&exact=${exact}`);
  });

  it("getAllSongs should call fetchAllSongs ", async () => {
    const spy = jest.spyOn(httpManager, "fetchAllSongs").mockImplementation(() => {
      return { id: 0 };
    });
    await httpManager.getAllSongs();
    expect(spy).toBeCalled();
  });

  it("getAllSongs should handle an error throw ", async () => {
    jest.spyOn(httpManager, "fetchAllSongs").mockImplementation(() => {
      throw new Error();
    });
    await expect(httpManager.getAllSongs()).rejects.toEqual("Échec lors de la requête GET /api/songs");
  });

  it("getAllPlaylists should call fetchAllPlaylists ", async () => {
    const spy = jest.spyOn(httpManager, "fetchAllPlaylists").mockImplementation(() => {
      return { id: 0 };
    });
    await httpManager.getAllPlaylists();
    expect(spy).toBeCalled();
  });

  it("getAllPlaylists should handle an error throw ", async () => {
    jest.spyOn(httpManager, "fetchAllPlaylists").mockImplementation(() => {
      throw new Error();
    });
    await expect(httpManager.getAllPlaylists()).rejects.toEqual("Échec lors de la requête GET /api/playlists");
  });

  it("getPlaylistById should send a GET request and return a playlist ", async () => {
    const playlist = { id: 0 };
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ playlist }) }));
    const id = 1;
    const spy = jest.spyOn(HTTPInterface, "GET");
    const res = await httpManager.getPlaylistById(id);
    expect(res).toEqual({ playlist });
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(`${httpManager.playlistBaseURL}/${id}`);
  });

  it("getPlaylistById should handle an error throw ", async () => {
    jest.spyOn(HTTPInterface, "GET").mockImplementation(() => {
      throw new Error();
    });
    const spy = jest.spyOn(window, "alert").mockImplementation(() => {});
    await httpManager.getPlaylistById(1);
    expect(spy).toBeCalled();
  });

  it("addNewPlaylist should send a POST request ", async () => {
    const playlist = { id: 0 };
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ playlist }) }));
    const spy = jest.spyOn(HTTPInterface, "POST");
    await httpManager.addNewPlaylist(playlist);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(`${httpManager.playlistBaseURL}`, playlist);
  });

  it("addNewPlaylist should handle an error throw ", async () => {
    jest.spyOn(HTTPInterface, "POST").mockImplementation(() => {
      throw new Error();
    });
    const spy = jest.spyOn(window, "alert").mockImplementation(() => {});
    await httpManager.addNewPlaylist({});
    expect(spy).toBeCalled();
  });

  it("updatePlaylist should send a PUT request ", async () => {
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({}) }));
    const playlist = { id: 1 };
    const spy = jest.spyOn(HTTPInterface, "PUT");
    await httpManager.updatePlaylist(playlist);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(`${httpManager.playlistBaseURL}/${playlist.id}`, playlist);
  });

  it("updatePlaylist should handle an error throw ", async () => {
    jest.spyOn(HTTPInterface, "PUT").mockImplementation(() => {
      throw new Error();
    });
    const spy = jest.spyOn(window, "alert").mockImplementation(() => {});
    await httpManager.updatePlaylist({});
    expect(spy).toBeCalled();
  });

  it("deletePlaylist should send a PUT request ", async () => {
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({}) }));
    const playlist = { id: 1 };
    const spy = jest.spyOn(HTTPInterface, "DELETE");
    await httpManager.deletePlaylist(playlist.id);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(`${httpManager.playlistBaseURL}/${playlist.id}`);
  });

  it("deletePlaylist should handle an error throw ", async () => {
    jest.spyOn(HTTPInterface, "DELETE").mockImplementation(() => {
      throw new Error();
    });
    const spy = jest.spyOn(window, "alert").mockImplementation(() => {});
    await httpManager.deletePlaylist(1);
    expect(spy).toBeCalled();
  });

  it("updateSong should send a PATCH request ", async () => {
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({}) }));
    const song = { id: 1 };
    const spy = jest.spyOn(HTTPInterface, "PATCH");
    await httpManager.updateSong(song.id);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(`${httpManager.songsBaseURL}/${song.id}/like`);
  });

  it("updateSong should handle an error throw ", async () => {
    jest.spyOn(HTTPInterface, "PATCH").mockImplementation(() => {
      throw new Error();
    });
    const spy = jest.spyOn(window, "alert").mockImplementation(() => {});
    await httpManager.updateSong(1);
    expect(spy).toBeCalled();
  });
});
