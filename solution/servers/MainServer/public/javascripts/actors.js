document.addEventListener('DOMContentLoaded', function() {
    let filteredActors;
    const ITEMS_PER_PAGE = 16;
    let loadMoreBtn = document.getElementById('load-more');
    loadMoreBtn.addEventListener('click', loadMoreActors);


    //inizializza select2 per il dropdown dei generi
    const genreSelect = $('.genre-select').select2({
        placeholder: "ALL GENRES",
        minimumResultsForSearch: Infinity,
        closeOnSelect: false,
        width: 'auto'
    });
    //bottone + aggiunta filtri apre il dropdown
    document.querySelector('.add-filter-btn').addEventListener('click', function() {
        genreSelect.select2('open');
    });

    //l hbs carica tutte le card, vengono presi i dati e salvati per lavorarci e fatte vedere in base ai criteri scelti
    const actorCards = document.querySelectorAll('.actor-card');
    let allActors = Array.from(actorCards).map(card => ({
        name: card.dataset.actorName,
        movies_count: parseInt(card.querySelector('.movie-count').textContent),
        avg_rating: parseFloat(card.querySelector('.avg_rating').textContent),
        genres: card.querySelector('.actor-meta span:last-child').textContent.split(',').map(g => g.trim())
    }));


    //se sceglie filtro all genres rimuove gli altri filtri e viceversa
    genreSelect.on('select2:select', function(e) {
        const selected = genreSelect.val();
        if (e.params.data.id === 'all') {
            genreSelect.val(['all']).trigger('change');
        }
        else if (selected.includes('all')) {
            const newSelected = selected.filter(item => item !== 'all');
            genreSelect.val(newSelected).trigger('change');
        }
    });
    //se rimuove l'ultimo filtro mette all come unico
    genreSelect.on('select2:unselect', function(e) {
        const selected = genreSelect.val();
        if (!selected || selected.length === 0)
            genreSelect.val(['all']).trigger('change');
    });

    genreSelect.on('select2:select select2:unselect', function() {
        applyFilters();
    });
    document.getElementById('sort-select').addEventListener('change', function() {
        applyFilters();
    });


    function applyFilters() {
        const selectedGenres = genreSelect.val() || [];
        const sortBy = document.getElementById('sort-select').value;

        //lowercase del genere selezionato se no non matcha con quelli scritti in minore nelle cards
        const normalizedSelectedGenres = selectedGenres.map(g => g.toLowerCase().trim());

        filteredActors = [...allActors];

        //ifltro per genere
        if (selectedGenres.length > 0 && !selectedGenres.includes('all')) {
            filteredActors = filteredActors.filter(actor => {
                if (!actor.genres) return false;
                return actor.genres.some(genre =>
                    normalizedSelectedGenres.includes(genre.toLowerCase().trim())
                );
            });
        }

        //sorting
        filteredActors.sort((a, b) => {
            if (sortBy === "name_asc")
                return a.name.localeCompare(b.name);
            else if (sortBy === "name_desc")
                return b.name.localeCompare(a.name);
            else if (sortBy === "movies_count")
                return b.movies_count - a.movies_count;
            else if(sortBy === "rating")
                return b.avg_rating - a.avg_rating;
            return 0;
        });

        //mostra prima pagina, 16 attori
        const paginatedActors = filteredActors.slice(0, ITEMS_PER_PAGE);
        renderActors(paginatedActors, false);

        if (filteredActors.length > ITEMS_PER_PAGE) {
            if (loadMoreBtn)
                loadMoreBtn.dataset.currentPage = '1';
            else
                createLoadMoreButton(filteredActors);

        } else if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
    }

    function loadMoreActors() {

        let currentPage = parseInt(loadMoreBtn.dataset.currentPage || '1');

        const endIndex = currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE;
        const paginatedActors = filteredActors.slice(currentPage*ITEMS_PER_PAGE, endIndex);

        renderActors(paginatedActors, true);
        loadMoreBtn.dataset.currentPage = (currentPage+1).toString();

        if (endIndex >= filteredActors.length) {
            loadMoreBtn.style.display = 'none';
        }
    }

    function renderActors(actors, append = false) {
        const container = document.getElementById('actors-container');
        if (!append) {
            container.innerHTML = '';
        }

        actors.forEach(actor => {
            const card = document.createElement('div');
            card.className = 'actor-card';
            card.dataset.actorName = actor.name;
            card.innerHTML = `
                <a href="/actors/${actor.name}">
                    <div class="actor-image">
                        <img src="/images/default-actor.jpg" alt="${actor.name}" onerror="this.style.display='none'">
                    </div>
                    <h3 class="actor-name">${actor.name}</h3>
                    <div class="actor-meta">
                        <span class="movie-count">${actor.movies_count} movies</span>
                        <span class="avg_rating">average rating: ${actor.avg_rating}</span>
                        <span>${actor.genres.join(', ')}</span>
                    </div>
                </a>`;
            container.appendChild(card);
        });
    }

    function createLoadMoreButton(filteredActors) {

        const container = document.createElement('div');
        container.className = 'load-more-container';
        container.innerHTML = '<button id="load-more">LOAD MORE</button>';
        document.querySelector('main').appendChild(container);

        const newLoadMoreBtn = document.getElementById('load-more');
        if (newLoadMoreBtn) {
            newLoadMoreBtn.addEventListener('click', loadMoreActors);
            newLoadMoreBtn.dataset.currentPage = '1';
        }
    }
    applyFilters();
});