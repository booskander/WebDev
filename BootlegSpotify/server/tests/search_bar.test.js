/* eslint-disable no-magic-numbers */
const app = require("../server");
const supertest = require("supertest");
const request = supertest(app);
const searchBarManager = require("../routes/search_bar").searchBarManager;

const API_URL = "/api/search";

describe("Playlist API test", () => {
  afterEach(async () => {
    jest.clearAllMocks();
    app.close();
  });

  it("GET request to /api/search should return 200 if element is found", async () => {
    const playlistsStub = [{ id: "a" }, { id: "b" }];
    const songsStub = [{ id: 0 }, { id: 1 }];

    jest.spyOn(searchBarManager, "search").mockImplementation(() => {
      return Promise.resolve({ playlists: playlistsStub, songs: songsStub });
    });
    const response = await request.get(`${API_URL}`).query("search_query=A&exact=false");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ playlists: playlistsStub, songs: songsStub });
  });

  it("GET request to /api/search should call search with the query and exact parameters", async () => {
    const playlistsStub = [{ id: "a" }, { id: "b" }];
    const songsStub = [{ id: 0 }, { id: 1 }];
    const query = "Co";
    const exact = false;

    const spy = jest.spyOn(searchBarManager, "search").mockImplementation(() => {
      return Promise.resolve({ playlists: playlistsStub, songs: songsStub });
    });
    await request.get(`${API_URL}`).query(`search_query=${query}&exact=${exact}`);
    expect(spy).toBeCalledWith(query, exact);
  });

  it("GET request to /api/search should return 500 if there is an error", async () => {
    jest.spyOn(searchBarManager, "search").mockImplementation(() => {
      return Promise.reject("Error");
    });
    const response = await request.get(`${API_URL}`).query("search_query=false");
    expect(response.status).toBe(500);
  });
});
