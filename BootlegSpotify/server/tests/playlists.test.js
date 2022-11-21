/* eslint-disable no-magic-numbers */
const app = require("../server");
const supertest = require("supertest");
const request = supertest(app);
const playlists = require("../data/playlists.json").playlists;
const playlistManager = require("../routes/playlists").playlistManager;

const API_URL = "/api/playlists";

describe("Playlist API test", () => {
  afterEach(async () => {
    jest.clearAllMocks();
    app.close();
  });
  it("GET request to /api/playlists should return all playlists", async () => {
    const response = await request.get(API_URL);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(playlists);
  });

  // TODO : Make sure to replace back default value to playlist.json
  it("GET request to /api/playlists/:id should return a playlist", async () => {
    const response = await request.get(`${API_URL}/0`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(playlists[0]);
  });

  it("GET request to /api/playlists/:id should return 404 if playlist not found", async () => {
    const response = await request.get(`${API_URL}/123456789`);
    expect(response.status).toBe(404);
  });

  it("POST request to /api/playlists should create a playlist", async () => {
    jest.spyOn(playlistManager, "addPlaylist").mockImplementation(() => {
      return Promise.resolve({
        id: "123456789",
        name: "Test Playlist",
        songs: [],
      })
    });
    const response = await request.post(API_URL).send({
      id: "123456789",
      name: "Test Playlist",
      songs: [],
    });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: "123456789",
      name: "Test Playlist",
      songs: [],
    });
  });

  it("PUT request to /api/playlists/:id should update a playlist", async () => {
    jest.spyOn(playlistManager, "updatePlaylist").mockImplementation(() => {
      return Promise.resolve({
        id: "0",
        name: "Updated Playlist",
        description: "Updated Description",
        thumbnail: "Updated Thumbnail",
        songs: [{ id: 0 }],
      })
    });
    const response = await request.put(`${API_URL}/0`).send({
      id: "0",
      name: "Original Playlist",
      description: "Original Description",
      thumbnail: "Original Thumbnail",
      songs: [{ id: 0 }],
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: "0" });
  });

  it("GET request to /api/playlists should return 500 error", async () => {
    jest.spyOn(playlistManager, "getAllPlaylists").mockImplementation(() => {
      return Promise.reject(new Error("Error"));
    });
    const response = await request.get(API_URL).send();
    expect(response.status).toBe(500);
  });

  it("GET request to /api/playlists/:id should return 500 error", async () => {
    jest.spyOn(playlistManager, "getPlaylistById").mockImplementation(() => {
      return Promise.reject(new Error("Error"));
    });
    const response = await request.get(`${API_URL}/0`).send();
    expect(response.status).toBe(500);
  });

  it("POST request to /api/playlists should return 400 if playlist is invalid", async () => {
    const response = await request.post(API_URL).send(undefined);
    expect(response.status).toBe(400);
  });

  it("POST request to /api/playlists should return 500 if there is an error", async () => {
    jest.spyOn(playlistManager, "addPlaylist").mockImplementation(() => {
      return Promise.reject("Test Error");
    });
    const response = await request.post(API_URL).send({
      id: "123456789",
      name: "Test Playlist",
      songs: [],
    });
    expect(response.status).toBe(500);
  });

  it("PUT request to /api/playlists should return 400 if playlist is invalid", async () => {
    const response = await request.put(`${API_URL}/0`).send(undefined);
    expect(response.status).toBe(400);
  });

  it("PUT request to /api/playlists should return 500 if there is an error", async () => {
    jest.spyOn(playlistManager, "updatePlaylist").mockImplementation(() => {
      return Promise.reject("Test Error");
    });
    const response = await request.put(`${API_URL}/0`).send({
      id: "123456789",
      name: "Test Playlist",
      songs: [],
    });
    expect(response.status).toBe(500);
  });

  it("DELETE request to /api/playlists/:id should delete a playlist", async () => {
    jest.spyOn(playlistManager, "deletePlaylist").mockImplementation(() => {
      return Promise.resolve(true);
    });
    const response = await request.delete(`${API_URL}/0`);
    expect(response.status).toBe(200);
  });

  it("DELETE request to /api/playlists/:id should return 404 if playlist not found", async () => {
    jest.spyOn(playlistManager, "deletePlaylist").mockImplementation(() => {
      return Promise.resolve(false);
    });
    const response = await request.delete(`${API_URL}/123456789`);
    expect(response.status).toBe(404);
  });

  it("DELETE request to /api/playlists/:id should return 500 error", async () => {
    jest.spyOn(playlistManager, "deletePlaylist").mockImplementation(() => {
      return Promise.reject(new Error("Error"));
    });
    const response = await request.delete(`${API_URL}/0`);
    expect(response.status).toBe(500);
  });
});
