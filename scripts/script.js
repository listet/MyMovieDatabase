'use strict';

import fetchMovies from './fetchMovies.js';
import { displayFavorites, handleFavoriteIconClick, addToFavorites, removeFromFavorites } from './favorites.js';


window.addEventListener('load', () => {
    // om HTML-dokumentet är Movie - kallar på funktoionen displayFavorites
    if (document.title === 'Movie') {
        displayFavorites();
    } else if ((document.title === 'My Movie Database')) {
        setupCarousel();
        top20();
        // Kallar på renderMovies() när man trycker på search-knappen
        document.querySelector('#searchBtn').addEventListener('click', event => {
            event.preventDefault();
            renderMovies();
        });
    }
    //Förslagsvis anropar ni era funktioner som skall sätta lyssnare, rendera objekt osv. härifrån
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
            // Hämta 5 random filmer från API
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

//top20 funktionen
async function top20() {
    try {
        const movies = await fetchMovies('https://santosnr6.github.io/Data/movies.json');

        // Rendera ut objektens namn i DOM'en så de blir synliga för en användare
        let mainRef = document.querySelector('#popularCardContainer');
        movies.forEach(movie => {
            const container = document.createElement('div');
            container.classList.add('movie-container')
            const titleElement = document.createElement('h3');
            titleElement.textContent = movie.title;

            // Tar fram bilden till filmen
            const imgRef = document.createElement('img');
            imgRef.classList.add('card');
            imgRef.src = movie.poster;
            imgRef.alt = movie.title;

            // Lägger in titeln och bilden i container och containern till mainRef 
            container.appendChild(titleElement);
            container.appendChild(imgRef);
            mainRef.appendChild(container);
        });
    } catch (error) {
        console.error('Error fetching movies', error);
    }
}

//Funktion för att hämta filmerna från API via sökfältet (de första 10 kommer upp).
// Kallar på funktionen renderMoviesList();
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

//Kollar om filmer finns i favoriter
function isMovieInFavorites(movieID) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.includes(movieID);
}

//Tar bort den aktiva classen "showMovieInfo" så endast en kan vara uppe åt gången
function removeActiveClass(clickedContainer) {
    const resultContainers = document.querySelectorAll('.resultMovieContainer');
    resultContainers.forEach(container => {
        if (container !== clickedContainer) {
            container.classList.remove('showMovieInfo');
        }
    });
}

//Tar fram sökresultaten
function renderMoviesList(movies) {
    const mainRef = document.querySelector('#resultsList');
    mainRef.innerHTML = ''; // Tar bort tidigare sökresultat
    const results__wrapper = document.querySelector('#results__wrapper');
    results__wrapper.classList.remove('d-none');

    //If-sats som skapar resultat-korten
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

            //If-sats som lägger in bild om ingen bild finns
            if (movie.Poster !== 'N/A') {
                imgRef.src = movie.Poster;
                imgRef.alt = movie.Title;
            } else {
                imgRef.src = './res/icon-image-not-found-free-vector.jpg';
                imgRef.alt = 'no picture available';
            }

            //skapar hjärticonen för favoriter
            const heartIcon = document.createElement('span');
            heartIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
            if (isMovieInFavorites(movie.imdbID)) {
                heartIcon.classList.add('favorite-icon');
                //Lägger in den gula klassen så man kan se vilka som redan ligger i favoriter
                heartIcon.classList.add('favorite-icon--yellow');
            } else {
                heartIcon.classList.add('favorite-icon');
            }

            //Kopplar alla skapade element till mainRef
            container.appendChild(titleRef);
            container.appendChild(imgRef);
            container.appendChild(heartIcon);
            mainRef.appendChild(container);

            //Lägger in ett lyssnare på alla containrar för att aktivera removeActiveClass()
            container.addEventListener('click', async event => {
                const clickedContainer = event.currentTarget; // Get the clicked container
                removeActiveClass(clickedContainer);

                //Om target = hjärta så aktiveras - handleFavoriteIconClick(movie.imdbID)
                //annars kommer class "showMovieInfo" med plot
                if (event.target.tagName === 'svg') {
                    handleFavoriteIconClick(movie.imdbID);
                } else {
                    const movieID = event.currentTarget.getAttribute('data-id');
                    const movieDetails = await fetchMovies(`http://www.omdbapi.com/?apikey=16ca3eb4&plot=full&i=${movieID}`);
                    const existingPlots = document.querySelectorAll('.resultMoviePlot');
                    existingPlots.forEach(plot => {
                        plot.remove(); // Tar bort plot för alla andra resultat
                    });

                    if (!container.classList.contains('showMovieInfo')) {
                        const plotRef = document.createElement('p');
                        plotRef.classList.add('resultMoviePlot');
                        plotRef.textContent = movieDetails.Plot;
                        container.appendChild(plotRef);
                    }

                    // Togglar "showMovieInfo" class
                    container.classList.toggle('showMovieInfo');
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

