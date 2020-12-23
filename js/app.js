//TODO: Reverse Border
//TODO: Search

// store the loaded songs so that they don't need to be fetched constantly, can be read from memory instead
let songs,
	decadeFilter = 0,
	decadeTemplate = {
		"1990": {},
		"2000": {},
		"2010": {},
		"2020": {}
	},
	reverse = false;
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
        decades = [];

    // depending on filters, build a record of accepted decades
    if(!decadeFilter) {
		decades = validDecades.map((x) => x);
		if(reverse) {
			decades = decades.reverse();
		}
    } else {
        decades.push(decadeFilter);
    }

    // foreach decade
    decades.forEach(decade => {
        html += `<h2 id="${decade}s">${decade}s</h2>`;
        // set the year to the current decade
        let year = decade,
			decadeEnd = decade,
			left = false;
		if(!reverse) {
            // and the end of the decade comes, as the new one starts
            decadeEnd = decade + 10;
	        // for each year that happens before the end of the decade
	        while(year < decadeEnd) {
	            // check if the year is supported
	            if(data[decade][year] !== undefined && data[decade][year].length > 0) {
					html += `<h3 id="year=${year}">${year}</h3>`;
	                // for each song mentioned
	                data[decade][year].forEach((album) => {
						html += _template(album);
	            	});
	            }
	            year++;
	        }
		} else {
			year = decadeEnd + 9;
			while(year >= decadeEnd) {
	            // check if the year is supported
	            if(data[decade][year] !== undefined && data[decade][year].length > 0) {
					html += `<h3 id="year=${year}">${year}</h3>`;
					let reversedSongs = data[decade][year].map((x) => x);
	                // for each song mentioned
	                reversedSongs.reverse().forEach((album) => {
						html += _template(album);
	            	});
	            }
	            year--;
	        }
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
			</h3>
		</dt>
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
			<!--div>
				<p>Listen: <a href="#">Apple Music</a>, <a href="#">Spotify</a>, <a href="#">Amazon Music</a></p>
			</div-->
		</dd>
	</dl>`;
	return html
}

// function highlight correct year in nav
function highlightDecade(decade) {
	document.querySelectorAll('.filter-decade').forEach(item => {
		item.parentElement.classList.remove('selected');
	});
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
	    fetch('./data.json?v=1014')
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

function searchSongs(filter) {
	let filteredSongs = {};
	validDecades.forEach(decade => {
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
				filteredSongs[decade][year] = songs[decade][year].filter(
					album => album.title.toLowerCase().includes(filter.toLowerCase().trim())
				);
			}
			year++;
		}
	});
	document.querySelector('#songs').innerHTML = _generateSongs(filteredSongs);
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
			document.getElementById('searchBox').value = '';
			// remove the 'selected' style from existing item
			document.querySelectorAll('.filter-decade').forEach(option => {
				option.parentElement.classList.remove('selected');
			})
			// if this is an actual decade link
			if(e.target.attributes.href !== undefined) {
				// figure out the decade
				const decade = e.target.attributes.href.value.substring(1,5)
				decadeFilter = decade;
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

	document.getElementById('searchBox').addEventListener('keyup', function(e) {
		document.querySelectorAll('.filter-decade').forEach(option => {
			option.parentElement.classList.remove('selected');
		})
		window.location.hash = '';
		searchSongs(this.value);
	});
	document.getElementById('reverseResults').addEventListener('change', function(e) {
		reverse = this.checked;
		let searchTerm = document.getElementById('searchBox').value;
		if(searchTerm === '') {
			getSongs(decadeFilter);
		} else {
			searchSongs(searchTerm);
		}
	});
}
