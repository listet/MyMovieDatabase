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

// Function to fetch 5 random movies from the API
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


//Fixa API!
async function renderMovies() {
    const apiUrl = await fetchMovies(`http://www.omdbapi.com/?apikey=16ca3eb4&s`);
    console.log(apiUrl)

    try {
        const searchInput = document.querySelector('#searchInput').value;
        //const apiUrl = await fetchMovies(`http://www.omdbapi.com/?apikey=16ca3eb4&s=${searchInput}`);
        // Check if the response is successful
        if (searchInput === apiUrl) {
            const movies = apiUrl.Search;
            renderMoviesList(movies);
        } else {
            console.error('Error in API response:', error);
        }
    } catch (error) {
        console.error('Error fetching movies from OMDB API:', error);
    }
}

function renderMoviesList(movies) {
    const mainRef = document.querySelector('#resultsList');
    mainRef.innerHTML = ''; // Clear previous search results

    if (movies && movies.length > 0) {
        console.log(movies)
        movies.forEach(movie => {
            const container = document.createElement('div'); // Create a container for each movie
            container.classList.add('resultMovieContainer'); // Add a class to the container

            const titleRef = document.createElement('p');
            titleRef.classList.add('resultMovieTitle')
            titleRef.textContent = movie.Title;

            const imgRef = document.createElement('img');
            imgRef.classList.add('resultMoviePoster')
            imgRef.src = movie.Poster;
            imgRef.alt = movie.Title;

            container.appendChild(titleRef);
            container.appendChild(imgRef);
            mainRef.appendChild(container);
        });
    } else {
        const pRef = document.createElement('p');
        pRef.textContent = 'No movies found';
        mainRef.appendChild(pRef);
    }
}

// Kallar på renderMovies() när man trycker på search-knappen
document.querySelector('#searchBtn').addEventListener('click', event => {
    event.preventDefault();
    renderMovies();
});
