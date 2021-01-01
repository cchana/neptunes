//TODO: Random track

// store the loaded songs so that they don't need to be fetched constantly, can be read from memory instead
let songs,
	// a global variable to store the decade that was used to filter
	storedDecadeFilter = 0,
	// a global variable to determine if reverse ordering is on or off
	reverse = false;

// a template of supported decades
const validDecades = [
	1990,
	2000,
	2010,
	2020
];

// Templates with data
function _generateSongs(data, decadeFilter){

    // store the HTML output
	let html = "",
		// what decades are allowed?
        decades = [];

    // was a decade filter passed?
    if(!decadeFilter) {
		// if not, copy the decades
		decades = validDecades.map((x) => x);
		// if reversing was requested
		if(reverse) {
			// reverse the decades
			decades = decades.reverse();
		}
	// else
    } else {
		// filter by decade
        decades.push(decadeFilter);
    }

    // foreach decade
    decades.forEach(decade => {
		// write out the decade
		let tracks = '';
        // set the year to the current decade
        let year = decade,
			// set initial decade end (depends on reversing)
			decadeEnd = decade,
			// left or right orientation
			left = false;
		// if reversing requested
		if(!reverse) {
            // and the end of the decade comes, as the new one starts
            decadeEnd = decade + 10;
	        // for each year that happens before the end of the decade
	        while(year < decadeEnd) {
	            // check if the year is supported
	            if(data[decade][year] !== undefined && data[decade][year].length > 0) {
	                // for each song mentioned
	                data[decade][year].forEach((album) => {
						tracks += _template(album);
	            	});
	            }
				// increment the year
	            year++;
	        }
		} else {
			// if reverse order, count only add 9 so decades don't cross over
			year = decadeEnd + 9;
			// for each year that happens in the decade
			while(year >= decadeEnd) {
	            // check if the year is supported
	            if(data[decade][year] !== undefined && data[decade][year].length > 0) {
					// copy the songs
					let reversedSongs = data[decade][year].map((x) => x);
	                // reverse songs, then for each of them
	                reversedSongs.reverse().forEach((album) => {
						tracks += _template(album);
	            	});
	            }
				// de-increment the year
	            year--;
	        }
		}
		if(tracks !== '') {
			html += `<section><h2 id="${decade}s">${decade}s</h2><h3 id="year=${year}"><span>${year}</span></h3><div>${tracks}</div></section>`;
		}
    });
	return html;
}

function _template(album) {
	// append the html
	let html = `<dl>
		<dt>`;
	if(album.artwork !== '') {
		html += `<img src="${album.artwork}" alt="${album.title + ' by ' + album.artist}" loading="lazy" />`;
	}
	html += `<h3>
				${album.title}
				<em>${album.artist}</em>
			</h3>`;
	if(album.links.apple !== '') {
		html += `<a href="${album.links.apple}">Apple Music</a>`;
	}
	html += `</dt>
		<dd>
			<ol>`;
	album.songs.forEach(song => {
		html += `<li>${song.title}`;
		if(song.featuring !== undefined && song.featuring.length > 0){
			html += ` <small>(featuring ${song.featuring.join(', ')})</small>`;
		}
		html += `</li>`;
	});
	html += `</ol>
		</dd>
	</dl>`;
	return html
}

// function highlight correct year in nav
function highlightDecade(decade) {
	// get all the decaces, then for each...
	document.querySelectorAll('.filter-decade').forEach(item => {
		// remove the highlight
		item.parentElement.classList.remove('selected');
	});
	// then highlight the current one
	document.querySelector('.songs-'+decade).classList.add('selected');
}

// function to actually fetch the songs
function getSongs(decade) {
	// find the container where they'll live
	let content = document.querySelector('#songs');
	// if songs were not previously loaded
	if(songs === undefined) {
		// add loading text first
		content.innerHTML = '<p>Loading</p>';
		// fetch the songs
	    fetch('./data-min.json?v=1015')
			// then process the response
	        .then((response) => {
				return response.json();
	        })
			// store songs for later and generate the UI
	        .then((data) => {
				songs = data;
				content.innerHTML = _generateSongs(data, decade);
	        })
			// catch any errors
	        .catch(function(error) {
	            console.log(error);
	        });
	} else {
		// if songs are already available, render just the year specified
		content.innerHTML = _generateSongs(songs, decade);
	}
}

// search function
function searchSongs(filter) {
	// empty list of filtered songs
	let filteredSongs = {};
	const searchTerm = filter.toLowerCase().trim();
	// for each valid decade
	validDecades.forEach(decade => {
		// refer to getSongs logic...
		let year = decade,
            // and the end of the decade comes, as the new one starts
            decadeEnd = decade + 10,
			left = false;
        // for each year that happens before the end of the decade
        while(year < decadeEnd) {
			if(songs[decade][year] !== undefined) {
				if(filteredSongs[decade] === undefined) {
					filteredSongs[decade] = {};
				}
				// filter the list of songs based on...
				filteredSongs[decade][year] = songs[decade][year].filter(function(album) {
					// the album title
					if(album.title.toLowerCase().includes(searchTerm)) {
						return album;
					}
					// the primary artist
					if(album.artist.toLowerCase().includes(searchTerm)) {
						return album;
					}
					// temp variable to say no matches found based on title or artist, so now going to check a few more things
					let matched = false;
					album.songs.forEach(song => {
						// if any song title matches
						if(song.title.toLowerCase().includes(searchTerm)) {
							// change mathced to true
							matched = true;
						}
						// or any featured artist matches
						song.featuring.forEach(featured => {
							if(featured.toLowerCase().includes(searchTerm)) {
								// change mathced to true
								matched = true;
							}
						})
					});
					// if a song or featured artist matches
					if(matched) {
						// return the album!
						return album;
					}
				});
			}
			year++;
		}
	});
	let songResults = _generateSongs(filteredSongs),
		container = document.querySelector('#songs');
	if(songResults !== '') {
		// populate the UI
		container.innerHTML = songResults;
	} else {
		container.innerHTML = `<p>There were no results matching your search</p>`;
	}
}

// when the page has loaded, start doing stuff
window.onload = function() {
	// if there is a hash in the URL (and that it isn't set to #0000s which means all)
	if(window.location.hash !== '' && window.location.hash !== '#0000s') {
		// get the decade from the hash
		const decade = parseInt(window.location.hash.substring(1,5));
		// if the decade is a valid decade starting at 1990
		if(!isNaN(decade) && decade >= 1990) {
			// load songs for that decade
			getSongs(decade);
			// highlight the decade
			highlightDecade(decade);
		} else {
			// otherwise get all songs
			getSongs();
		}
	// if no hash, this is the root and fetch it all
	} else {
		getSongs();
	}

	/*
	** This section will apply click events to all of the navigation links
	*/
	// get all the filters
	document.querySelectorAll('.filter-decade').forEach(filter => {
		// add click events
		filter.addEventListener('click', function(e) {
			// stop the default happening
			e.preventDefault();
			// if selecting a decade, clear the filter
			document.getElementById('searchBox').value = '';
			// remove the 'selected' style from existing item
			document.querySelectorAll('.filter-decade').forEach(option => {
				option.parentElement.classList.remove('selected');
			})
			// if this is an actual decade link
			if(e.target.attributes.href !== undefined) {
				// figure out the decade
				const decade = e.target.attributes.href.value.substring(1,5)
				storedDecadeFilter = decade;
				// update the url hash
				window.location.hash = `#${decade}s`;
				// get the songs
				getSongs(decade);
				// and highlight in the navigation
				e.target.parentElement.classList.add('selected');
			} else {
				// otherwise get all the songs
				getSongs();
			}
			// and scroll to the top
			window.scroll(0,0);
		});
	});

	// when typing
	document.getElementById('searchBox').addEventListener('keyup', function(e) {
		// remove highlighted decade
		document.querySelectorAll('.filter-decade').forEach(option => {
			option.parentElement.classList.remove('selected');
		})
		// remove URL hash
		window.location.hash = '';
		// reset the stored decade filter
		storedDecadeFilter = 0;
		// search the songs
		searchSongs(this.value);
	});

	// when changing the reverse ordering
	document.getElementById('reverseResults').addEventListener('change', function(e) {
		// set reverse to true or false
		reverse = this.checked;
		// get the value from the search term (this can persist)
		let searchTerm = document.getElementById('searchBox').value;
		// if the search term is empty
		if(searchTerm === '') {
			// get songs for the decade highlighted
			getSongs(storedDecadeFilter);
		} else {
			// else, search songs with the term
			searchSongs(searchTerm);
		}
	});
}
