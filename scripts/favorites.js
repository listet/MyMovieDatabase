'use strict';

import fetchMovies from './fetchMovies.js';

// window.addEventListener('load', () => {
//     console.log('load');
//     //Förslagsvis anropar ni era funktioner som skall sätta lyssnare, rendera objekt osv. härifrån
//     // displayFavorites()
// });

// //Favoriets

// // Funktion för att hantera klick på favorit-knappen och lägga till/ta bort film från favoritlistan
function handleFavoriteIconClick(imdbID) {
    console.log('favoriter!');
    const isFavorite = JSON.parse(localStorage.getItem('favorites') || '[]').some(movie => movie === imdbID);

    if (isFavorite) {
        removeFromFavorites(imdbID);
    } else {
        addToFavorites(imdbID);
    }
    // displayFavorites(); // Uppdatera visningen av favoritlistan
}

// // Funktion för att lägga till en film i favoritlistan i local storage
function addToFavorites(imdbID) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const heartIcon = document.querySelector(`[data-id="${imdbID}"] .favorite-icon`);
    console.log('heart', heartIcon)
    favorites.push(imdbID);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    heartIcon.classList.add('favorite-icon--yellow');
    console.log('lägg till')
}

// // Funktion för att ta bort en film från favoritlistan i local storage
function removeFromFavorites(imdbID) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const heartIcon = document.querySelector(`[data-id="${imdbID}"] .favorite-icon--yellow`);
    console.log('heart', heartIcon)
    favorites = favorites.filter(movie => movie !== imdbID);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    heartIcon.classList.remove('favorite-icon--yellow');
    console.log('ta bort')
}

// // Funktion för att visa favoritlistan på HTML-sidan
async function displayFavorites() {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesContainer = document.querySelector('#favoritesContainer');
    console.log('fav', favoritesContainer)
    favoritesContainer.innerHTML = ''; // Rensa container

    // Iterate over each IMDb ID in the favorites list
    for (const imdbID of favorites) {
        try {
            // Fetch movie details from the API
            const movie = await fetchMovies(`http://www.omdbapi.com/?apikey=16ca3eb4&i=${imdbID}`);
            console.log(movie)
            // Create elements to display movie title and poster
            const container = document.createElement('div');
            container.classList.add('resultMovieContainer');

            const titleRef = document.createElement('p');
            titleRef.classList.add('resultMovieTitle');
            titleRef.textContent = movie.Title;

            container.setAttribute('data-id', imdbID);

            const imgRef = document.createElement('img');
            imgRef.classList.add('resultMoviePoster');
            imgRef.src = movie.Poster === 'N/A' ? './res/icon-image-not-found-free-vector.jpg' : movie.Poster;
            imgRef.alt = movie.Title;

            // Create heart icon for favorites
            const heartIcon = document.createElement('span');
            heartIcon.classList.add('favorite-icon--yellow');
            heartIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';

            // Add click event for the heart icon
            heartIcon.addEventListener('click', () => {
                handleFavoriteIconClick(imdbID);
                displayFavorites()
            });

            container.appendChild(titleRef);
            container.appendChild(imgRef);
            container.appendChild(heartIcon);
            favoritesContainer.appendChild(container);
        } catch (error) {
            console.error('Error fetching movie details:', error);
        }
    }
}

export { displayFavorites, handleFavoriteIconClick, addToFavorites, removeFromFavorites };