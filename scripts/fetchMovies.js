'use strict';


// Function to fetch movies from the API
async function fetchMovies(url) {
    const response = await fetch(url);
    const data = await response.json();
    let movies = data;
    return movies;
}


export default fetchMovies;