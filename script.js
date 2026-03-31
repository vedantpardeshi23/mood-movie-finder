const API_KEY = "c4db4cc891539c2c6dbf0454060e19e4";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// Mood → Genre IDs
const moodGenres = {
  Happy: [35, 10751],
  Sad: [18, 10749],
  Excited: [28, 53],
  Chill: [14, 16]
};

let allMovies = [];
let currentMood = "";

// when user clicks mood
function chooseMood(mood) {
  currentMood = mood;

  // highlight button (simplified)
  let buttons = document.getElementsByClassName("mood-btn");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("active");
  }

  let clickedBtn = document.querySelector('.mood-btn[data-mood="' + mood + '"]');
  if (clickedBtn != null) {
    clickedBtn.classList.add("active");
  }

  document.getElementById("controls").style.display = "flex";

  document.getElementById("searchBox").value = "";
  document.getElementById("sortSelect").value = "default";

  fetchMovies(mood);
}

// fetch movies
function fetchMovies(mood) {
  let genres = moodGenres[mood];
  let genreString = "";

  // manually join instead of join()
  for (let i = 0; i < genres.length; i++) {
    genreString += genres[i];
    if (i != genres.length - 1) {
      genreString += ",";
    }
  }

  document.getElementById("spinner").style.display = "block";
  document.getElementById("movieGrid").innerHTML = "";
  document.getElementById("noResults").style.display = "none";

  let url = BASE_URL + "/discover/movie?api_key=" + API_KEY +
            "&with_genres=" + genreString +
            "&sort_by=popularity.desc&page=1";

  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      allMovies = data.results;
      showMovies(allMovies);
      document.getElementById("spinner").style.display = "none";
    })
    .catch(function(err) {
      console.log(err);
      document.getElementById("movieGrid").innerHTML =
        "<p style='color:red; text-align:center;'>Error loading movies</p>";
      document.getElementById("spinner").style.display = "none";
    });
}

// display movies
function showMovies(movieList) {
  let grid = document.getElementById("movieGrid");
  let noResults = document.getElementById("noResults");

  grid.innerHTML = "";

  if (movieList.length == 0) {
    noResults.style.display = "block";
    return;
  }

  noResults.style.display = "none";

  for (let i = 0; i < movieList.length; i++) {
    let movie = movieList[i];

    if (!movie.poster_path) continue;

    let posterUrl = IMG_BASE + movie.poster_path;
    let title = movie.title;
    let rating = movie.vote_average;

    let card = document.createElement("div");
    card.className = "movie-card";

    card.innerHTML =
      "<img src='" + posterUrl + "'>" +
      "<p>" + title + "</p>" +
      "<p>Rating: " + rating + "</p>";

    grid.appendChild(card);
  }
}

// filter movies
function filterMovies() {
  let searchText = document.getElementById("searchBox").value.toLowerCase();

  let filtered = [];

  for (let i = 0; i < allMovies.length; i++) {
    if (allMovies[i].title.toLowerCase().includes(searchText)) {
      filtered.push(allMovies[i]);
    }
  }

  let sorted = applySortLogic(filtered);
  showMovies(sorted);
}

// sort movies
function sortMovies() {
  let searchText = document.getElementById("searchBox").value.toLowerCase();

  let filtered = [];

  for (let i = 0; i < allMovies.length; i++) {
    if (allMovies[i].title.toLowerCase().includes(searchText)) {
      filtered.push(allMovies[i]);
    }
  }

  let sorted = applySortLogic(filtered);
  showMovies(sorted);
}

// sorting logic 
function applySortLogic(list) {
  let sortValue = document.getElementById("sortSelect").value;

  if (sortValue == "rating") {
    list.sort(function(a, b) {
      return b.vote_average - a.vote_average;
    });
  } 
  else if (sortValue == "popularity") {
    list.sort(function(a, b) {
      return b.popularity - a.popularity;
    });
  }

  return list;
}