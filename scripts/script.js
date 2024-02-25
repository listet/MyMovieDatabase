'use strict';

window.addEventListener('load', () => {
    console.log('load');
    //Förslagsvis anropar ni era funktioner som skall sätta lyssnare, rendera objekt osv. härifrån
    setupCarousel();
    top20();
});

//Denna funktion skapar funktionalitet för karusellen
async function setupCarousel() {
    console.log('carousel');

    const buttons = document.querySelectorAll('[data-carousel-btn]');
    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const offset = btn.dataset.carouselBtn === 'next' ? 1 : -1;
            const slides = btn.closest('[data-carousel]').querySelector('[data-slides]');
            const activeSlide = slides.querySelector('[data-active]');
            let newIndex = [...slides.children].indexOf(activeSlide) + offset;

            if (newIndex < 0) {
                newIndex = slides.children.length - 1;
            } else if (newIndex >= slides.children.length) {
                newIndex = 0;
            }
            // Fetch 5 random movies from the API
            try {
                const movies = await fetchMovies('https://santosnr6.github.io/Data/movies.json');
                console.log(movies)
                const iframes = document.querySelectorAll('iframe');
                for (let index = 0; index < iframes.length; index++) {
                    iframes[index].src = movies.splice(Math.floor(Math.random() * movies.length), 1)[0].trailer_link;
                }
            } catch (error) {
                console.error('Error fetching movies', error);
            }

            // Lägger till active/tar bort active
            slides.children[newIndex].dataset.active = true;
            delete activeSlide.dataset.active;
        });
    });
}

// Function to fetch movies from the API
async function fetchMovies(url) {
    const response = await fetch(url);
    const data = await response.json();
    let movies = data;
    return movies;
}


async function top20() {
    try {
        const movies = await fetchMovies('https://santosnr6.github.io/Data/movies.json');

        // Rendera ut objektens namn i DOM'en istället så de blir synliga för en användare
        let mainRef = document.querySelector('#popularCardContainer');
        movies.forEach(movie => {
            const container = document.createElement('div');
            container.classList.add('movie-container')
            const titleElement = document.createElement('h3');
            titleElement.textContent = movie.title;

            // Create an image element for the movie
            const imgRef = document.createElement('img');
            imgRef.classList.add('card');
            imgRef.src = movie.poster;
            imgRef.alt = movie.title;

            // Append the title and image to the container
            container.appendChild(titleElement);
            container.appendChild(imgRef);

            // Append the container to the main reference element
            mainRef.appendChild(container);
        });
    } catch (error) {
        console.error('Error fetching movies', error);
    }
}

async function renderMovies() {

    try {
        const searchInput = document.querySelector('#searchInput').value;
        const apiUrl = await fetchMovies(`http://www.omdbapi.com/?apikey=16ca3eb4&s=${searchInput}`);
        console.log(apiUrl)
        renderMoviesList(apiUrl.Search);
    } catch (error) {
        console.error('Error fetching movies from OMDB API:', error);
    }
}

function renderMoviesList(movies) {
    const mainRef = document.querySelector('#resultsList');
    mainRef.innerHTML = ''; // Tar bort tidigare sökresultat
    const results__wrapper = document.querySelector('#results__wrapper');
    results__wrapper.classList.remove('d-none');

    let plotRef;

    if (movies && movies.length > 0) {
        movies.forEach(movie => {
            const container = document.createElement('div');
            container.classList.add('resultMovieContainer');

            const titleRef = document.createElement('p');
            titleRef.classList.add('resultMovieTitle')
            titleRef.textContent = movie.Title;

            container.setAttribute('data-id', movie.imdbID);

            const imgRef = document.createElement('img');
            imgRef.classList.add('resultMoviePoster')

            if (movie.Poster !== 'N/A') {
                imgRef.src = movie.Poster;
                imgRef.alt = movie.Title;
            } else {
                imgRef.src = './res/icon-image-not-found-free-vector.jpg';
                imgRef.alt = 'no picture available';
            }

            //skapar hjärticonen för favoriter
            const heartIcon = document.createElement('span');
            heartIcon.classList.add('favorite-icon');
            heartIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';

            // Lägg till en klickhändelse för hjärtikonen
            heartIcon.addEventListener('click', () => {
                handleFavoriteIconClick(movie.imdbID);
            });

            container.appendChild(titleRef);
            container.appendChild(imgRef);
            container.appendChild(heartIcon);
            mainRef.appendChild(container);

            container.addEventListener('click', async event => {
                const movieID = event.currentTarget.getAttribute('data-id')
                const movieDetails = await fetchMovies(`http://www.omdbapi.com/?apikey=16ca3eb4&plot=full&i=${movieID}`);
                console.log(movieDetails)
                container.classList.toggle('showMovieInfo');

                const existingPlot = container.querySelector('.resultMoviePlot');
                if (existingPlot) {
                    existingPlot.remove();
                }

                if (container.classList.contains('showMovieInfo')) {
                    const plotRef = document.createElement('p');
                    plotRef.classList.add('resultMoviePlot');
                    plotRef.textContent = movieDetails.Plot;
                    container.appendChild(plotRef);
                }
            });
        });
    } else {
        const pRef = document.createElement('p');
        pRef.textContent = 'No movies found';
        pRef.classList.add('errorText');
        mainRef.appendChild(pRef);
    }
}

// Kallar på renderMovies() när man trycker på search-knappen
document.querySelector('#searchBtn').addEventListener('click', event => {
    event.preventDefault();
    renderMovies();
});

//Favoriets

// // Funktion för att hantera klick på favorit-knappen och lägga till/ta bort film från favoritlistan
function handleFavoriteIconClick(imdbID) {
    console.log('favoriter!');
    const isFavorite = JSON.parse(localStorage.getItem('favorites') || '[]').some(movie => movie.imdbID === movieId);
    const heartIcon = document.querySelector(`[data-id="${imdbID}"] .favorite-icon`);

    if (isFavorite) {
        removeFromFavorites(imdbID);
        heartIcon.classList.remove('favorite-icon--yellow');
    } else {
        const movie = JSON.parse(localStorage.getItem('movies')).find(movie => movie.imdbID === movieId);
        addToFavorites(imdbID);
        heartIcon.classList.add('favorite-icon--yellow');
    }

    displayFavorites(); // Uppdatera visningen av favoritlistan
}

// // // Funktion för att hantera klick på favorit-knappen och lägga till/ta bort film från favoritlistan
// document.querySelectorAll('.favorite-icon').forEach(icon => {
//     icon.addEventListener('click', () => {
//         const movieId = icon.parentElement.dataset.id;
//         handleFavoriteIconClick(movieId);
//     });
// });



// // Funktion för att lägga till en film i favoritlistan
function addToFavorites(movie) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.push(movie);
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// // Funktion för att ta bort en film från favoritlistan
function removeFromFavorites(movieId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(movie => movie.imdbID !== movieId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// // Funktion för att visa favoritlistan på HTML-sidan
function displayFavorites() {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesContainer = document.querySelector('#favoritesContainer');
    favoritesContainer.innerHTML = ''; // Rensa container

    favorites.forEach(movie => {
        const container = document.createElement('div');
        container.classList.add('resultMovieContainer');

        const titleRef = document.createElement('p');
        titleRef.classList.add('resultMovieTitle')
        titleRef.textContent = movie.Title;

        container.setAttribute('data-id', movie.imdbID);

        const imgRef = document.createElement('img');
        imgRef.classList.add('resultMoviePoster')

        if (movie.Poster !== 'N/A') {
            imgRef.src = movie.Poster;
            imgRef.alt = movie.Title;
        } else {
            imgRef.src = './res/icon-image-not-found-free-vector.jpg';
            imgRef.alt = 'no picture available';
        }

        // Create heart icon for favorites
        const heartIcon = document.createElement('span');
        heartIcon.classList.add('favorite-icon');
        heartIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';

        // Add click event for the heart icon
        heartIcon.addEventListener('click', () => {
            handleFavoriteIconClick(movie.imdbID);
        });

        container.appendChild(titleRef);
        container.appendChild(imgRef);
        container.appendChild(heartIcon);
        favoritesContainer.appendChild(container);
    });
}

