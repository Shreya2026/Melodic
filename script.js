document.addEventListener('DOMContentLoaded', () => {
    const audio = new Audio();
    let currentSongCard = null; // Track the currently playing song card

    const songlistsDiv = document.querySelector('.songlists');
    const movieSongs = {
        'one': [
            { title: 'Bappa', artist: 'Vishal Dadlani', src: 'assets/Songs/Banjo.mp3' },
            { title: 'Pee Paa Ke', artist: 'Vishal Dadlani, Nakash Aziz', src: 'assets/Songs/Pee Paa Ke.mp3' },
            { title: 'Rada', artist: 'Vishal Dadlani , Nakash Aziz', src: 'assets/Songs/Rada.mp3' },
            { title: 'Rehmo Karam', artist: 'Ajay Gogavale', src: 'assets/Songs/Rehmo Karam.mp3' },
            { title: 'Udan Choo', artist: 'Hriday Gattani', src: 'assets/Songs/Udan Choo.mp3' }
        ],
        'two': [
            { title: 'Gazab Ka Hai Yeh Din Sanam Re', artist: 'Amaal Mallik , Arijit Singh', src: 'assets/Songs/Gazab Ka Hai Yeh Din Sanam Re.mp3' },
            { title: 'Hua Hain Aaj Pehli Baar Sanam Re', artist: 'Amaal Mallik , Armaan Malik , Palak Muchchal', src: 'assets/Songs/Hua Hain Aaj Pehli Baar Sanam Re.mp3' },
            { title: 'Sanam Re', artist: 'Arijit Singh , Mithoon', src: 'assets/Songs/Sanam Re.mp3' },
            { title: 'Chhote Chhote Tamashe', artist: 'Shaan', src: 'assets/Songs/Chhote.mp3' }
        ],
        'three': [
            { title: 'Chogada', artist: 'Darshan Raval , Asees Kaur', src: 'assets/Songs/Chogada.mp3' },
            { title: 'Rangtaari', artist: 'Dev Negi,Yo Yo Honey Singh', src: 'assets/Songs/Rangtaari.mp3' },
            { title: 'Tera Hua', artist: 'Atif Aslaam', src: 'assets/Songs/Tera Hua.mp3' },
            { title: 'Dholida', artist: 'Udit Narayan , Neha Kakkar , Palak Muchchal , Raja Hasan', src: 'assets/Songs/Dholida.mp3' }
        ],
        'four': [
            { title: 'Bolo Kya Karun', artist: 'Abhijeet Srivastava', src: 'assets/Songs/Bolo Kya Karun.mp3' },
            { title: 'Dil Sheher', artist: 'Sameer Rahat', src: 'assets/Songs/Dil Sheher.mp3' },
            { title: 'Jhoome Raanjhana', artist: 'Prathamesh Tambe , Nakash Aziz', src: 'assets/Songs/Jhoome Raanjhana.mp3' }
        ],
        'five': [
            { title: 'Abhi Mujh Mein Kahin', artist: 'Sonu Nigam , Ajay-Atul', src: 'assets/Songs/Abhi Mujh Mein Kahin.mp3' },
            { title:'Deva Shree Ganesha',artist: 'Ajay Gogavale , Ajay-Atul', src: 'assets/Songs/Deva Shree Ganesha.mp3' },
            { title: 'Gun Gun Guna', artist: 'Sunudhi Chauhan , Udit Narayan , Ajay-Atul', src: 'assets/Songs/Gun Gun Guna.mp3' },
            { title: 'Shah Ka Rutba', artist: 'Sukhwinder Singh , Ajay-Atul , Anand Raj Anand , Krishna Beuraa', src: 'assets/Songs/Shah Ka Rutba.mp3' }
        ],
        'six': [
            { title: 'Teri Gali', artist: 'Aakanksha Sharma', src: 'assets/Songs/Teri Gali.mp3' }
        ],
    };

    function populateSongList(songs) {
        songlistsDiv.innerHTML = ''; // Clear existing songs
        songs.forEach(song => {
            songlistsDiv.innerHTML += `
                <div class="song-card" data-title="${song.title}" data-artist="${song.artist}" data-src="${song.src}">
                    <div class="songHead">
                        <h4>${song.title}</h4>
                        <p>${song.artist}</p>
                    </div>
                    <div class="play-song play3" data-src="${song.src}">
                        <img src="assets/Images/songlistplay.svg" alt="Play"/>
                    </div>
                    <div class="play-song pause3" style="display: none;">
                        <img src="assets/Images/songlistpause.svg" alt="Pause"/>
                    </div>
                </div>
            `;
        });

        // Add event listeners for play and pause buttons
        addPlayPauseListeners();
    }

    function addPlayPauseListeners() {
        const play3Buttons = document.querySelectorAll('.play3');
        const pause3Buttons = document.querySelectorAll('.pause3');

        play3Buttons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const songUrl = button.getAttribute('data-src');
                const songCard = button.closest('.song-card');

                if (audio.src !== songUrl) {
                    audio.src = songUrl;
                    audio.play();
                    if (currentSongCard) {
                        togglePlayPause(currentSongCard, false);
                    }
                    currentSongCard = songCard;
                    togglePlayPause(songCard, true);
                    updatePlayBarInfo2(songCard);
                } else {
                    audio.play();
                    togglePlayPause(songCard, true);
                }
            });
        });

        pause3Buttons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                audio.pause();
                const songCard = button.closest('.song-card');
                togglePlayPause(songCard, false);
            });
        });
    }

    const playButtons = document.querySelectorAll('.card .play2');
    const pauseButtons = document.querySelectorAll('.card .pause2');
    const seekPlayButton = document.querySelector('.seekplay');
    const seekPauseButton = document.querySelector('.seekpause');
    const songInfoDiv = document.querySelector('.songinfo');
    const songTimeDiv = document.querySelector('.songtime');

    playButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const card = button.closest('.card');
            const id = card.getAttribute('data-id');
            const songs = movieSongs[id] || [];

            populateSongList(songs);

            if (songs.length > 0) {
                const randomIndex = Math.floor(Math.random() * songs.length);
                const randomSong = songs[randomIndex];

                if (audio.src !== randomSong.src) {
                    audio.src = randomSong.src;
                    audio.play();
                    if (currentSongCard) {
                        togglePlayPause(currentSongCard, false); // Revert previous card's button
                    }
                    currentSongCard = card;
                    togglePlayPause(card, true);
                    updatePlayBarInfo2(card);
                } else {
                    audio.play();
                    togglePlayPause(card, true);
                }
            }
        });
    });

    pauseButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            audio.pause();
            const card = button.closest('.card');
            togglePlayPause(card, false);
        });
    });

    seekPlayButton.addEventListener('click', () => {
        if (audio.src) {
            audio.play();
            if (currentSongCard) {
                togglePlayPause(currentSongCard, true);
            }
        }
    });

    seekPauseButton.addEventListener('click', () => {
        if (audio.src) {
            audio.pause();
            if (currentSongCard) {
                togglePlayPause(currentSongCard, false);
            }
        }
    });

    function togglePlayPause(card, isPlaying) {
        const playButton = card.querySelector('.play2');
        const pauseButton = card.querySelector('.pause2');
        const play3Button = card.querySelector('.play3');
        const pause3Button = card.querySelector('.pause3');

        if (isPlaying) {
            if (playButton) playButton.style.display = 'none';
            if (pauseButton) pauseButton.style.display = 'block';
            if (play3Button) play3Button.style.display = 'none';
            if (pause3Button) pause3Button.style.display = 'block';
            seekPlayButton.style.display='none';
            seekPauseButton.style.display='block';
        } else {
            if (playButton) playButton.style.display = 'block';
            if (pauseButton) pauseButton.style.display = 'none';
            if (play3Button) play3Button.style.display = 'block';
            if (pause3Button) pause3Button.style.display = 'none';
            seekPlayButton.style.display='block';
            seekPauseButton.style.display='none';
        }
    }

    function updatePlayBarInfo2(songElement){
        const title=songElement.getAttribute('data-title');
        const artist=songElement.getAttribute('data-artist');
        songInfoDiv.innerHTML=`<div>${title}</div><div>${artist}</div>`;
        updateSongTime();
    }

    

    function updatePlaybarInfo(songCard) {
        // Ensure this function only updates once per song
        //  if (songCard === currentSongCard) {
        //      return; // Skip if the same song card is already being updated
        //  }
        
        // Clear previous song info
        songInfoDiv.innerHTML = '';
        songTimeDiv.innerHTML = '';
    
        const title = songCard.querySelector('[data-title]').getAttribute('data-title');
        songInfoDiv.innerHTML = `<div>${title}</div>`;
        updateSongTime(); // Ensure this is called only once per song
    }

    function updateSongTime() {
        // Clear any previous time update listeners
        audio.removeEventListener('timeupdate', updateTime);
    
        // Add a new listener for the time update
        audio.addEventListener('timeupdate', updateTime);
    }
    
    function updateTime() {
        const currentTime = audio.currentTime;
        const duration = audio.duration;
        const currentTimeFormatted = formatTime(currentTime);
        const durationFormatted = formatTime(duration);
    
        songTimeDiv.innerHTML = `<p>${currentTimeFormatted} / ${durationFormatted}</p>`;
    }
    
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    audio.addEventListener('ended', () => {
        if (currentSongCard) {
            togglePlayPause(currentSongCard, false);
        }
        seekPlayButton.style.display = 'block';
        seekPauseButton.style.display = 'none';
    });

    // Hamburger menu toggle
    const hamburger = document.querySelector(".hamburger");
    const closeButton = document.querySelector(".close");
    const leftMenu = document.querySelector(".left");

    if (hamburger) {
        hamburger.addEventListener("click", () => {
            if (leftMenu.style.left === "0px") {
                leftMenu.style.left = "-130%"; // Adjust to your off-screen position
            } else {
                leftMenu.style.left = "0";
            }
        });
    } else {
        console.error("Hamburger element not found.");
    }

    if (closeButton) {
        closeButton.addEventListener("click", () => {
            if (leftMenu.style.left === "-130%") {
                leftMenu.style.left = "0"; // Adjust to your off-screen position
            } else {
                leftMenu.style.left = "-130%";
            }
        });
    } else {
        console.error("Close button element not found.");
    }

    // Search bar toggle and functionality
    const searchClick = document.getElementById('searchClick');
    const searchBar = document.getElementById('search-bar');
    const searchResults = document.getElementById('search-results');

    if (searchClick) {
        searchClick.addEventListener('click', () => {
            if (searchBar.style.display === "none" || !searchBar.style.display) {
                searchBar.style.display = "block"; // Show the search bar
            } else {
                searchBar.style.display = "none";  // Hide the search bar
            }
        });
    } else {
        console.error("Search click element not found.");
    }

    searchBar.addEventListener('input', () => {
        const query = searchBar.value.toLowerCase();
        searchResults.innerHTML = ''; // Clear previous results

        if (query.length > 0) {
            const filteredData = Object.values(movieSongs).flat().filter(song =>
                song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query)
            );

            if (filteredData.length > 0) {
                searchResults.style.display = 'block';
                filteredData.forEach(song => {
                    const resultItem = document.createElement('div');
                    resultItem.textContent = `${song.title} by ${song.artist}`;
                    resultItem.addEventListener('click', () => {
                        searchBar.value = song.title; // Set the input value to the clicked item
                        searchResults.style.display = 'none'; // Hide results
                        audio.src = song.src;
                        audio.play();
                        if (currentSongCard) {
                            togglePlayPause(currentSongCard, false);
                        }
                        currentSongCard = null; // Clear current card
                        updatePlaybarInfo({ querySelector: () => ({ getAttribute: () => song.title }) }); // Fake song card
                        seekPlayButton.style.display = 'none';
                        seekPauseButton.style.display = 'block';
                    });
                    searchResults.appendChild(resultItem);
                });
            } else {
                searchResults.style.display = 'none'; // Hide results if no match
            }
        } else {
            searchResults.style.display = 'none'; // Hide results if input is empty
        }
    });

    // Hide search results when clicking outside
    document.addEventListener('click', (event) => {
        if (!searchBar.contains(event.target) && !searchResults.contains(event.target) && !searchClick.contains(event.target)) {
            searchResults.style.display = 'none';
        }
    });
});
