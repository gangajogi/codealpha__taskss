const audio = document.getElementById("audio");

const playBtn = document.getElementById("playBtn");
const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");

const progressBar = document.getElementById("progressBar");

const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const volumeBar = document.getElementById("volumeBar");
const volumeText = document.getElementById("volumeText");

const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");

const playlist = document.getElementById("playlist");

const songInput = document.getElementById("songInput");


/* =====================================================
   MUSIC DATA
===================================================== */

let songs = [];
let currentSongIndex = 0;


/* =====================================================
   INDEXED DB
   Songs will remain saved after refresh
===================================================== */

const DB_NAME = "MyMusicDatabase";
const DB_VERSION = 1;
const STORE_NAME = "songs";

let db;


/* =====================================================
   OPEN DATABASE
===================================================== */

function openDatabase() {

    return new Promise(function (resolve, reject) {

        const request = indexedDB.open(DB_NAME, DB_VERSION);


        request.onupgradeneeded = function (event) {

            const database = event.target.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {

                database.createObjectStore(STORE_NAME, {
                    keyPath: "id",
                    autoIncrement: true
                });

            }

        };


        request.onsuccess = function (event) {

            db = event.target.result;

            resolve(db);

        };


        request.onerror = function () {

            reject(request.error);

        };

    });

}


/* =====================================================
   SAVE SONG TO DATABASE
===================================================== */

function saveSongToDatabase(song) {

    return new Promise(function (resolve, reject) {

        const transaction =
            db.transaction(STORE_NAME, "readwrite");

        const store =
            transaction.objectStore(STORE_NAME);


        const request = store.add({
            name: song.name,
            artist: song.artist,
            file: song.file
        });


        request.onsuccess = function () {

            resolve(request.result);

        };


        request.onerror = function () {

            reject(request.error);

        };

    });

}


/* =====================================================
   GET ALL SAVED SONGS
===================================================== */

function getSavedSongs() {

    return new Promise(function (resolve, reject) {

        const transaction =
            db.transaction(STORE_NAME, "readonly");

        const store =
            transaction.objectStore(STORE_NAME);


        const request = store.getAll();


        request.onsuccess = function () {

            resolve(request.result);

        };


        request.onerror = function () {

            reject(request.error);

        };

    });

}


/* =====================================================
   LOAD SAVED SONGS
===================================================== */

async function loadSavedSongs() {

    try {

        const savedSongs = await getSavedSongs();


        songs = savedSongs.map(function (song) {

            return {

                id: song.id,

                name: song.name,

                artist: song.artist,

                file: song.file,

                url: URL.createObjectURL(song.file)

            };

        });


        displayPlaylist();


        if (songs.length > 0) {

            loadSong(0);

        }

    } catch (error) {

        console.error(
            "Could not load saved songs:",
            error
        );

    }

}


/* =====================================================
   ADD SONGS
===================================================== */

songInput.addEventListener("change", async function () {

    const files = Array.from(this.files);


    if (files.length === 0) {

        return;

    }


    for (const file of files) {

        const song = {

            name: file.name.replace(/\.[^/.]+$/, ""),

            artist: "My Music",

            file: file,

            url: URL.createObjectURL(file)

        };


        try {

            const id =
                await saveSongToDatabase(song);


            song.id = id;

            songs.push(song);

        } catch (error) {

            console.error(
                "Could not save song:",
                error
            );

        }

    }


    displayPlaylist();


    if (songs.length > 0 && !audio.src) {

        loadSong(0);

    }


    this.value = "";

});


/* =====================================================
   LOAD SONG
===================================================== */

function loadSong(index) {

    if (songs.length === 0) {

        return;

    }


    currentSongIndex = index;


    const song =
        songs[currentSongIndex];


    audio.src = song.url;


    songTitle.textContent =
        song.name;


    artistName.textContent =
        song.artist;


    displayPlaylist();


    audio.load();

}


/* =====================================================
   PLAY SONG
===================================================== */

function playSong() {

    if (songs.length === 0) {

        alert("Please add a song first.");

        return;

    }


    audio.play();

}


/* =====================================================
   PAUSE SONG
===================================================== */

function pauseSong() {

    audio.pause();

}


/* =====================================================
   PLAY / PAUSE BUTTON
===================================================== */

playBtn.addEventListener("click", function () {

    if (audio.paused) {

        playSong();

    } else {

        pauseSong();

    }

});


/* =====================================================
   PLAY BUTTON ICON
===================================================== */

audio.addEventListener("play", function () {

    playBtn.textContent = "⏸";

});


audio.addEventListener("pause", function () {

    playBtn.textContent = "▶";

});


/* =====================================================
   NEXT SONG
===================================================== */

nextBtn.addEventListener("click", function () {

    if (songs.length === 0) {

        return;

    }


    currentSongIndex++;


    if (currentSongIndex >= songs.length) {

        currentSongIndex = 0;

    }


    loadSong(currentSongIndex);

    playSong();

});


/* =====================================================
   PREVIOUS SONG
===================================================== */

previousBtn.addEventListener("click", function () {

    if (songs.length === 0) {

        return;

    }


    currentSongIndex--;


    if (currentSongIndex < 0) {

        currentSongIndex =
            songs.length - 1;

    }


    loadSong(currentSongIndex);

    playSong();

});


/* =====================================================
   AUTO NEXT SONG
===================================================== */

audio.addEventListener("ended", function () {

    if (songs.length === 0) {

        return;

    }


    currentSongIndex++;


    if (currentSongIndex >= songs.length) {

        currentSongIndex = 0;

    }


    loadSong(currentSongIndex);

    playSong();

});


/* =====================================================
   PROGRESS BAR
===================================================== */

audio.addEventListener("timeupdate", function () {

    if (audio.duration) {

        const progress =
            (audio.currentTime /
            audio.duration) * 100;


        progressBar.value =
            progress;


        currentTime.textContent =
            formatTime(audio.currentTime);

    }

});


/* =====================================================
   SONG DURATION
===================================================== */

audio.addEventListener("loadedmetadata", function () {

    duration.textContent =
        formatTime(audio.duration);

});


/* =====================================================
   CLICK PROGRESS BAR
===================================================== */

progressBar.addEventListener("input", function () {

    if (audio.duration) {

        audio.currentTime =
            (progressBar.value / 100) *
            audio.duration;

    }

});


/* =====================================================
   VOLUME
===================================================== */

volumeBar.addEventListener("input", function () {

    audio.volume =
        volumeBar.value;


    const volume =
        Math.round(
            volumeBar.value * 100
        );


    volumeText.textContent =
        volume + "%";

});


/* =====================================================
   DISPLAY PLAYLIST
===================================================== */

function displayPlaylist() {

    playlist.innerHTML = "";


    if (songs.length === 0) {

        playlist.innerHTML = `
            <div class="empty-message">
                No songs added yet.
                <br>
                Click <b>+ Add Songs</b> to add music.
            </div>
        `;

        return;

    }


    songs.forEach(function (song, index) {

        const songItem =
            document.createElement("div");


        songItem.className =
            "song-item";


        if (index === currentSongIndex) {

            songItem.classList.add("active");

        }


        songItem.innerHTML = `
            <span class="song-number">
                ${index + 1}
            </span>

            <span class="song-name">
                🎵 ${song.name}
            </span>

            <span class="song-duration">
                ▶
            </span>
        `;


        songItem.addEventListener(
            "click",
            function () {

                loadSong(index);

                playSong();

            }
        );


        playlist.appendChild(songItem);

    });

}


/* =====================================================
   FORMAT TIME
===================================================== */

function formatTime(time) {

    if (isNaN(time)) {

        return "0:00";

    }


    const minutes =
        Math.floor(time / 60);


    const seconds =
        Math.floor(time % 60);


    return minutes + ":" +
        (seconds < 10 ? "0" : "") +
        seconds;

}


/* =====================================================
   START MUSIC PLAYER
===================================================== */

async function startMusicPlayer() {

    try {

        await openDatabase();

        await loadSavedSongs();

    } catch (error) {

        console.error(
            "Database error:",
            error
        );

    }

}


/* =====================================================
   START
===================================================== */

startMusicPlayer();