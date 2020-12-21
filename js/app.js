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
            decadeEnd = decade + 10;
        // for each year that happens before the end of the decade
        while(year < decadeEnd) {
            // check if the year is supported
            if(data[decade][year] !== undefined) {
                // for each song mentioned
                data[decade][year].forEach(song => {
                    // append the html
            		html += `<li>
                    <h3>${song.title}</h3>
                    ${song.artists.primary}`;
                    if(song.artists.featuring.length > 0) {
                        html += `<span class="featuring">(feat. ${song.artists.featuring.join(', ')})</span>`;
                    }
                    html += `<span class="album">`;
                    if(song.album) {
                        html += song.album;
                    }
                    html += `<small>(${year})</small></span></li>`;
            	});
            }
            year++;
        }
        html += `</ol>`;
    });
	return html;
}

function getSongs(decade) {
	let content = document.querySelector('#songs');
	content.innerHTML = '<p>Loading</p>';
    fetch('./data.json?v=1000')
        .then((response) => {
            return response.json();
        })
        .then((data) => {
			content.innerHTML = _generateSongs(data, decade);
        })
        .catch(function(error) {
            console.log(error);
        });
}

getSongs();
