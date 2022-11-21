import { Library } from "../../src/assets/js/library";
import HTTPManager from "../../src/assets/js/http_manager";

describe("Library tests", () => {
  const assignMock = jest.fn();
  const clearHTML = () => (document.body.innerHTML = "");
  let library;

  const setUpHTML = () => {
    const playlistContainer = document.createElement("span");
    playlistContainer.setAttribute("id", "playlist-container");
    document.body.appendChild(playlistContainer);

    const songContainer = document.createElement("span");
    songContainer.setAttribute("id", "song-container");
    document.body.appendChild(songContainer);

    const searchBar = document.createElement("input");
    searchBar.setAttribute("id", "search-input");
    document.body.appendChild(searchBar);

    const searchButton = document.createElement("button");
    searchButton.setAttribute("id", "search-btn");
    document.body.appendChild(searchButton);

    const specificSearchInput = document.createElement("input");
    specificSearchInput.setAttribute("id", "exact-search");
    document.body.appendChild(specificSearchInput);

    const clearSearch = document.createElement("i");
    clearSearch.setAttribute("id", "clear-search-bar");
    document.body.appendChild(clearSearch);
  };

  beforeEach(() => {
    delete window.location;
    window.location = { assign: assignMock };
    setUpHTML();
    library = new Library(new HTTPManager());
    jest.spyOn(library.HTTPManager, "search").mockImplementation(async () => []);
    jest.spyOn(library.HTTPManager, "getAllPlaylists").mockImplementation(async () => []);
    jest.spyOn(library.HTTPManager, "getAllSongs").mockImplementation(async () => []);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    assignMock.mockClear();
    clearHTML();
  });

  it("generateLists should call buildPlaylistItem and buildSongItem, and append children to containers", () => {
    const buildPlaylistItemSpy = jest.spyOn(library, "buildPlaylistItem").mockImplementation(() => {
      return document.createElement("a");
    });
    const buildSongItemSpy = jest.spyOn(library, "buildSongItem").mockImplementation(() => {
      return document.createElement("p");
    });
    library.generateLists([{}], [{}]);
    expect(buildPlaylistItemSpy).toBeCalled();
    expect(buildSongItemSpy).toBeCalled();
    const playlistContainer = document.getElementById("playlist-container");
    expect(playlistContainer.hasChildNodes()).toEqual(true);
    const songContainer = document.getElementById("song-container");
    expect(songContainer.hasChildNodes()).toEqual(true);
  });

  it("buildPlaylistItem should build playlist's item", () => {
    const playlist = {
      name: "Ma Premiere Playlist",
      description: "Playlist de base",
      thumbnail: "assets/img/default.png",
    };
    const playlistItem = library.buildPlaylistItem(playlist);
    expect(playlistItem.hasChildNodes()).toEqual(true);
    expect(playlistItem.innerHTML).toEqual(
      `<div class="playlist-preview"><img src=\"http://localhost:5020/${playlist.thumbnail}\"><i class="fa fa-2x fa-play-circle hidden playlist-play-icon"></i></div><p>${playlist.name}</p><p>${playlist.description}</p>`
    );
  });

  it("buildSongItem should build song's item", () => {
    const song = {
      id: 0,
      name: "Whip",
      artist: "prazkhanal",
      src: "./assets/media/01_song.mp3",
      genre: "Electronic",
      liked: false,
    };
    const songItem = library.buildSongItem(song);
    expect(songItem.hasChildNodes()).toEqual(true);
    expect(songItem.innerHTML).toEqual(
      `<p>${song.name}</p><p>${song.genre}</p><p>${song.artist}</p><button class="fa-heart fa-2x fa-regular"></button>`
    );
  });

  it("buildSongItem should add a call to HTTPManager.updateSong on click event and change the classList", () => {
    const spy = jest.spyOn(library.HTTPManager, "updateSong").mockImplementation(() => {});
    const songLikedClassList = "fa-heart fa-2x fa";
    const songNotLikedClassList = "fa-heart fa-2x fa-regular";
    const songItem = library.buildSongItem({ liked: true }).lastChild;
    expect(songItem.classList.toString()).toEqual(songLikedClassList);
    songItem.click();
    expect(spy).toHaveBeenCalled();
    expect(songItem.classList.toString()).toEqual(songNotLikedClassList);
  });

  describe("Search bar tests", () => {
    it("clicking on the search button should prevent form submission and call search", async () => {
      const event = new Event("click");
      const eventSpy = jest.spyOn(event, "preventDefault");
      const searchSpy = jest.spyOn(library, "search").mockImplementation(() => {});

      await library.load();
      document.getElementById("search-btn").dispatchEvent(event);

      expect(eventSpy).toHaveBeenCalled();
      expect(searchSpy).toHaveBeenCalled();
    });

    it("search should call generateLists with correct filtered lists", async () => {
      const searchSpy = jest.spyOn(library.HTTPManager, "search").mockImplementation(async () => {
        return { playlists: [], songs: [] };
      });
      const generateListsSpy = jest.spyOn(library, "generateLists").mockImplementation(() => {});

      await library.search("Co", false);

      expect(searchSpy).toHaveBeenCalled();
      expect(generateListsSpy).toHaveBeenCalled();
    });
  });
});
