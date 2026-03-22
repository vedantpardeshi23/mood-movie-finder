const API_KEY = "c4db4cc891539c2c6dbf0454060e19e4";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
 
// Mood → Genre IDs mapping (from TMDB genre list)
const moodGenres = {
  Happy:   [35, 10751],      // Comedy, Family
  Sad:     [18, 10749],      // Drama, Romance
  Excited: [28, 53],         // Action, Thriller
  Chill:   [14, 16]          // Fantasy, Animation
};
 
// I'll store all fetched movies here so I can filter/sort without re-fetching
let allMovies = [];
let currentMood = "";
 
// ---- When user clicks a mood button ----
function chooseMood(mood) {
  currentMood = mood;
 
  // highlight the active button
  let buttons = document.querySelectorAll(".mood-btn");
  buttons.forEach(btn => btn.classList.remove("active"));
  let clickedBtn = document.querySelector(`.mood-btn[data-mood="${mood}"]`);
  if (clickedBtn) clickedBtn.classList.add("active");
 
  // show the search/sort controls
  document.getElementById("controls").style.display = "flex";
 
  // clear old search and sort
  document.getElementById("searchBox").value = "";
  document.getElementById("sortSelect").value = "default";
 
  fetchMovies(mood);
}
 
// ---- Fetch movies from TMDB ----
async function fetchMovies(mood) {
  let genres = moodGenres[mood];
  let genreString = genres.join(",");
 
  // show loading spinner
  document.getElementById("spinner").style.display = "block";
  document.getElementById("movieGrid").innerHTML = "";
  document.getElementById("noResults").style.display = "none";
 
  try {
    let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreString}&sort_by=popularity.desc&page=1`;
    let response = await fetch(url);
    let data = await response.json();
 
    allMovies = data.results;
    showMovies(allMovies);
 
  } catch (err) {
    console.log("Something went wrong:", err);
    document.getElementById("movieGrid").innerHTML = "<p style='color:red; text-align:center;'>Could not load movies. Check your API key!</p>";
  }
 
  document.getElementById("spinner").style.display = "none";
}
 
// ---- Display movies on the page ----
function showMovies(movieList) {
  let grid = document.getElementById("movieGrid");
  let noResults = document.getElementById("noResults");
  grid.innerHTML = "";
 
  if (movieList.length === 0) {
    noResults.style.display = "block";
    return;
  }
 
  noResults.style.display = "none";
 
  movieList.forEach(movie => {
    // some movies don't have a poster, skip them
    if (!movie.poster_path) return;
 
    let posterUrl = IMG_BASE + movie.poster_path;
    let title = movie.title;
    let rating = movie.vote_average.toFixed(1);
 
    let card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <img src="${posterUrl}" alt="${title}" loading="lazy" />
      <div class="card-info">
        <p class="card-title">${title}</p>
        <p class="card-rating">⭐ ${rating} <span>/ 10</span></p>
      </div>
    `;
 
    grid.appendChild(card);
  });
}
 
// ---- Search / Filter ----
function filterMovies() {
  let searchText = document.getElementById("searchBox").value.toLowerCase();
 
  let filtered = allMovies.filter(movie => {
    return movie.title.toLowerCase().includes(searchText);
  });
 
  // also apply current sort on the filtered list
  let sorted = applySortLogic(filtered);
  showMovies(sorted);
}
 
// ---- Sort movies ----
function sortMovies() {
  let searchText = document.getElementById("searchBox").value.toLowerCase();
 
  // filter first, then sort
  let filtered = allMovies.filter(movie => {
    return movie.title.toLowerCase().includes(searchText);
  });
 
  let sorted = applySortLogic(filtered);
  showMovies(sorted);
}
 
// helper to sort a list based on the dropdown value
function applySortLogic(list) {
  let sortValue = document.getElementById("sortSelect").value;
 
  if (sortValue === "rating") {
    // sort by rating high to low
    list = [...list].sort((a, b) => b.vote_average - a.vote_average);
  } else if (sortValue === "popularity") {
    // sort by popularity high to low
    list = [...list].sort((a, b) => b.popularity - a.popularity);
  }
 
  return list;
}