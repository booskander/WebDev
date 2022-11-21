import { jest } from "@jest/globals";
import HTTPManager from "../../src/assets/js/http_manager";
import PlayListEditor from "../../src/assets/js/playlist_editor";

describe("Playlist Editor tests", () => {
  const assignMock = jest.fn();
  const clearHTML = () => (document.body.innerHTML = "");
  global.URL.createObjectURL = jest.fn();
  let playListEditor;
  let songStubs;

  const setUpHTML = () => {
    const playListForm = document.createElement("form");
    playListForm.setAttribute("id", "playlist-form");
    document.body.appendChild(playListForm);

    const playlistName = document.createElement("input");
    playlistName.setAttribute("id", "name");
    document.body.appendChild(playlistName);

    const playlistDescription = document.createElement("input");
    playlistDescription.setAttribute("id", "description");
    document.body.appendChild(playlistDescription);

    const imageDisplay = document.createElement("img");
    imageDisplay.setAttribute("id", "image-preview");
    imageDisplay.setAttribute("src", "");
    document.body.appendChild(imageDisplay);

    const songContainer = document.createElement("div");
    songContainer.setAttribute("id", "song-list");
    document.body.appendChild(songContainer);

    const inputContainer = document.createElement("div");
    songContainer.appendChild(inputContainer);
    inputContainer.appendChild(document.createElement("label"));

    const songInput = document.createElement("input");
    songInput.type = "select";
    songInput.value = "Whip";
    songInput.setAttribute("class", "song-input");
    inputContainer.appendChild(songInput);

    const imageInput = document.createElement("input");
    imageInput.setAttribute("id", "image");
    document.body.appendChild(imageInput);

    const addSongButton = document.createElement("button");
    addSongButton.setAttribute("id", "add-song-btn");
    document.body.appendChild(addSongButton);

    const songDataList = document.createElement("div");
    songDataList.setAttribute("id", "song-dataList");
    document.body.appendChild(songDataList);

    const deleteButton = document.createElement("button");
    deleteButton.setAttribute("id", "playlist-delete");
    document.body.appendChild(deleteButton);

    const formSubmit = document.createElement("input");
    formSubmit.setAttribute("id", "playlist-submit");
    document.body.appendChild(formSubmit);
  };

  beforeEach(() => {
    delete window.location;
    window.location = {
      assign: () => ({
        href: "abc",
      }),
    };

    setUpHTML();
    playListEditor = new PlayListEditor(new HTTPManager());
    jest.spyOn(playListEditor.HTTPManager, "getPlaylistById").mockImplementation(async () => {});
    jest.spyOn(playListEditor.HTTPManager, "fetchSong").mockImplementation(async () => {});
    jest.spyOn(playListEditor.HTTPManager, "getAllSongs").mockImplementation(async () => []);
    jest.spyOn(playListEditor.HTTPManager, "updatePlaylist").mockImplementation(async () => {});
    jest.spyOn(playListEditor.HTTPManager, "addNewPlaylist").mockImplementation(async () => {});

    songStubs = [
      { name: "Whip" },
      { name: "Overflow" },
      { name: "Intrigue Fun" },
      { name: "Bounce" },
      { name: "Summer Pranks" },
    ];
  });

  afterEach(() => {
    jest.restoreAllMocks();
    assignMock.mockClear();
    clearHTML();
  });

  it("buildDataList should correctly build data list", () => {
    const dataListContainer = document.createElement("datalist");
    playListEditor.buildDataList(dataListContainer, songStubs);
    const childrenElements = dataListContainer.children;
    for (let i = 0; i < childrenElements.length; i++) {
      expect(childrenElements[i].tagName).toEqual("OPTION");
      expect(childrenElements[i].value).toEqual(songStubs[i].name);
    }
    expect(dataListContainer.childElementCount).toEqual(songStubs.length);
  });

  it("updateImageDisplay should update image display", () => {
    playListEditor.files = songStubs;
    playListEditor.updateImageDisplay();
    const imagePreview = document.getElementById("image-preview");
    expect(imagePreview.src).not.toEqual("");
  });

  it("addItemSelect should call preventDefault for events", () => {
    const randomEvent = new Event("");
    const randomEventPreventDefaultSpy = jest.spyOn(randomEvent, "preventDefault").mockImplementation(() => {});
    playListEditor.addItemSelect(randomEvent);
    expect(randomEventPreventDefaultSpy).toBeCalled();
  });

  it("addItemSelect should correctly add item to container", () => {
    playListEditor.addItemSelect(new Event(""));
    const newItem = document.getElementById("song-list").lastElementChild;
    expect(newItem.childElementCount).toEqual(3);
    expect(newItem.children[0].tagName).toEqual("LABEL");
    expect(newItem.children[1].tagName).toEqual("INPUT");
    expect(newItem.children[1].getAttribute("id")).toEqual("song-2");
    expect(newItem.children[1].getAttribute("list")).toEqual("song-dataList");
    expect(newItem.children[1].classList.contains("song-input")).toBeTruthy();

    expect(newItem.children[2].tagName).toEqual("BUTTON");
    expect(newItem.children[2].classList.contains("fa-minus")).toBeTruthy();
  });

  it("addItemSelect should remove event target's parent node upon clicked", () => {
    const randomEvent = new Event("");
    jest.spyOn(randomEvent, "preventDefault").mockImplementation(() => {});
    playListEditor.addItemSelect(randomEvent);
    const removeInputButton = document.getElementsByClassName("fa fa-minus")[0];
    removeInputButton.dispatchEvent(new Event("click"));
    const parent = document.getElementById("song-2");
    expect(parent).toBeFalsy();
  });

  it("load should call HTTPManager.getAllSongs and buildDataList", async () => {
    const httpSpy = jest.spyOn(playListEditor.HTTPManager, "getAllSongs").mockImplementation(() => {});
    const playListEditorBuildDataListSpy = jest.spyOn(playListEditor, "buildDataList").mockImplementation(() => {});
    jest.spyOn(playListEditor, "updateImageDisplay").mockImplementation(() => {});
    jest.spyOn(playListEditor, "addItemSelect").mockImplementation(() => {});
    await playListEditor.load();
    expect(httpSpy).toBeCalled();
    expect(playListEditorBuildDataListSpy).toBeCalled();
  });

  it("load should correctly add updateImageDisplay as eventListener on change event to image input", async () => {
    const imageSpy = jest.spyOn(playListEditor, "updateImageDisplay").mockImplementation(() => {});
    await playListEditor.load();
    const imageInput = document.getElementById("image");
    expect(imageInput.dispatchEvent(new Event("change")));
    expect(imageSpy).toBeCalled();
  });

  it("load should correctly add addItemSelect as eventListener on click event to add song button", async () => {
    const buttonSpy = jest.spyOn(playListEditor, "addItemSelect").mockImplementation(() => {});
    await playListEditor.load();
    const addSongButton = document.getElementById("add-song-btn");
    expect(addSongButton.dispatchEvent(new Event("click")));
    expect(buttonSpy).toBeCalled();
  });

  it("load should correctly call createPlaylist and preventDefault on submit event to the form", async () => {
    const submitSpy = jest.spyOn(playListEditor, "createPlaylist").mockImplementation(async () => {});
    await playListEditor.load();
    const form = document.getElementById("playlist-form");
    const randomSubmitEvent = new Event("submit");
    const eventSpy = jest.spyOn(randomSubmitEvent, "preventDefault").mockImplementation(() => {});
    expect(form.dispatchEvent(randomSubmitEvent));
    expect(submitSpy).toBeCalled();
    expect(eventSpy).toBeCalled();
  });

  it("load should correctly call loadForEdit if passed an id", async () => {
    const loadForEditSpy = jest.spyOn(playListEditor, "loadForEdit").mockImplementation(() => {});
    const location = new URL("https://www.example.com?id=10");
    location.assign = jest.fn();
    location.replace = jest.fn();
    location.reload = jest.fn();

    delete window.location;
    window.location = location;

    await playListEditor.load();
    expect(loadForEditSpy).toBeCalled();
  });

  it("load should correctly add an event listener to the delete button", async () => {
    const event = new Event("click");
    jest.spyOn(playListEditor, "loadForEdit").mockImplementation(() => {});
    const spy = jest.spyOn(playListEditor, "deletePlaylist").mockImplementation(() => {});

    const location = new URL("https://www.example.com?id=10");
    location.assign = jest.fn();
    location.replace = jest.fn();
    location.reload = jest.fn();

    delete window.location;
    window.location = location;

    await playListEditor.load();

    document.getElementById("playlist-delete").dispatchEvent(event);

    expect(spy).toBeCalled();
  });

  it("createPlaylist should correctly call getImageInput and HTTPManager.addNewPlaylist", async () => {
    const httpAddSpy = jest.spyOn(playListEditor.HTTPManager, "addNewPlaylist").mockImplementation(() => {});
    const form = document.getElementById("playlist-form");
    jest.spyOn(form, "elements", "get").mockReturnValue({ name: "", description: "" });
    await playListEditor.createPlaylist(form);
    expect(httpAddSpy).toBeCalled();
  });

  it("createPlaylist should correctly call HTTPManager.updatePlaylist with an id", async () => {
    const httpUpdateSpy = jest.spyOn(playListEditor.HTTPManager, "updatePlaylist").mockImplementation(() => {});
    const form = document.getElementById("playlist-form");
    jest.spyOn(form, "elements", "get").mockReturnValue({ name: "", description: "" });
    await playListEditor.createPlaylist(form, "abc");
    expect(httpUpdateSpy).toBeCalled();
  });

  it("deletePlaylist should correctly call HTTPManager.deletePlaylist with an id", async () => {
    const httpDeleteSpy = jest.spyOn(playListEditor.HTTPManager, "deletePlaylist").mockImplementation(() => {});
    await playListEditor.deletePlaylist("abc");
    expect(httpDeleteSpy).toBeCalled();
  });

  it("getImageInput should not return an image for invalid inputs", async () => {
    expect(playListEditor.getImageInput(undefined)).toEqual(Promise.resolve());
  });
});
