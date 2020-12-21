// store the loaded songs so that they don't need to be fetched constantly, can be read from memory instead
let songs;

// Templates with data
function _generateSongs(data, decadeFilter){
    // store the HTML output
	let html = "",
        decades = [];

    // depending on filters, build a record of accepted decades
    if(!decadeFilter) {
        decades = [
            1990,
            2000,
            2010,
            2020
        ];
    } else {
        decades.push(decadeFilter);
    }

    // foreach decade
    decades.forEach(decade => {
        html += `<h2 id="${decade}s">${decade}</h2>
        <ol>`;
        // set the year to the current decade
        let year = decade,
            // and the end of the decade comes, as the new one starts
            decadeEnd = decade + 10,
			left = false,
			previousAlbum = '';
        // for each year that happens before the end of the decade
        while(year < decadeEnd) {
            // check if the year is supported
            if(data[decade][year] !== undefined) {
                // for each song mentioned
                data[decade][year].forEach(song => {
					// if the song has no album associated, or the previous album is not the same as this one
					if(!song.album || previousAlbum !== song.album) {
						// toggle left between true and false
						left = !left;
					}
                    // append the html
            		html += `<li class="${left ? 'left' : 'right'}">
                    <h3>${song.title}</h3>
                    ${song.artists.primary}`;
                    if(song.artists.featuring.length > 0) {
                        html += `<span class="featuring">(feat. ${song.artists.featuring.join(', ')})</span>`;
                    }
                    html += ` <span class="album">`;
                    if(song.album) {
                        html += song.album;
                    }
                    html += ` <small>(${year})</small></span></li>`;
					// update the check for the next song to determine if the album has changed
					previousAlbum = song.album;
            	});
            }
            year++;
        }
        html += `</ol>`;
    });
	return html;
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
	    fetch('./data.json?v=1001')
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

// When the page starts, get the songs
getSongs();

// add click events to links on the page
window.onload = function() {
	// get all the filters
	document.querySelectorAll('.filter-decade').forEach(filter => {
		// add click events
		filter.addEventListener('click', function(e) {
			// stop the default happening
			e.preventDefault();
			// remove the 'selected' style from existing item
			document.querySelectorAll('.filter-decade').forEach(option => {
				option.parentElement.classList.remove('selected');
			})
			// if this is an actual decade link
			if(e.target.attributes.href !== undefined) {
				// only fetch songs for that decade
				getSongs(e.target.attributes.href.value.substring(1,5));
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
}
