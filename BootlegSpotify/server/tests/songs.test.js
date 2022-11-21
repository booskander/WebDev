/* eslint-disable no-magic-numbers */
const app = require("../server");
const supertest = require("supertest");
const request = supertest(app);
const fs = require("fs");
const songs = require("../data/songs.json").songs;
const songsManager = require("../routes/songs").songsManager;

const API_URL = "/api/songs";

describe("Songs API", () => {
  afterAll(async () => {
    jest.clearAllMocks();
    app.close();
  });
  it("GET request to /api/songs should return all songs", async () => {
    const response = await request.get(API_URL);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(songs);
  });
  it("GET request to /api/songs/:id should return a song", async () => {
    const response = await request.get(`${API_URL}/0`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(songs[0]);
  });
  it("GET request to /api/songs/:id should return 404 if song not found", async () => {
    const response = await request.get(`${API_URL}/123456789`);
    expect(response.status).toBe(404);
  });
  it("GET request to /api/songs/player/:id should stream a song", async () => {
    const response = await request.get(`${API_URL}/player/0`);
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toEqual(":audio/mpeg");
  });
  it("GET request to /api/songs/player/:id should call createReadStream to stream the song file", async () => {
    const spy = jest.spyOn(fs, "createReadStream");
    await request.get(`${API_URL}/player/0`);
    expect(spy).toBeCalled();
  });
  it("GET request to /api/songs should return 500 if error", async () => {
    jest.spyOn(songsManager, "getAllSongs").mockImplementation(() => {
      return Promise.reject("Test Error");
    });
    const response = await request.get(API_URL);
    expect(response.status).toBe(500);
  });
  it("GET request to /api/songs/:id should return 500 if error", async () => {
    jest.spyOn(songsManager, "getSongById").mockImplementation(() => {
      return Promise.reject("Test Error");
    });
    const response = await request.get(`${API_URL}/0`);
    expect(response.status).toBe(500);
  });
  it("GET request to /api/player/:id should return 500 if error", async () => {
    jest.spyOn(songsManager, "getSongById").mockImplementation(() => {
      return Promise.reject("Test Error");
    });
    const response = await request.get(`${API_URL}/player/0`);
    expect(response.status).toBe(500);
  });
  it("PATCH request to /api/songs/:id should update a song", async () => {
    jest.spyOn(songsManager, "updateSongLike").mockImplementation(() => {
      return true;
    });
    const response = await request.patch(`${API_URL}/0/like`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ liked: true });
  });
});
