const API_KEY = '502578770db455c118a3038b240e3f5c';
const USERNAME = 'last_aezi';

// JSONP callback function
window.lastFmCallback = function (data) {
	displayTracks(data.recenttracks.track);
};

// JSONP callback for top songs
window.lastFmTopAlbumsCallback = function (data) {
	displayTopAlbums(data.toptracks.track);
};

// JSONP callback for top artists
window.lastFmTopArtistsCallback = function (data) {
	displayTopArtistsGrid(data.topartists.artist);
};

// Fetch tracks using JSONP
function fetchLastFmTracks() {
	const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&limit=4&format=json&callback=lastFmCallback`;

	// Create and append script tag
	const script = document.createElement('script');
	script.src = url;
	script.onerror = () => {
		document.getElementById('last-fm-recent').innerHTML = '<p style="color: #999;">Unable to load tracks</p>';
	};
	document.head.appendChild(script);
}

// Fetch top songs (last 7 days)
function fetchLastFmTopAlbums() {
	const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${USERNAME}&api_key=${API_KEY}&limit=5&period=7day&format=json&callback=lastFmTopAlbumsCallback`;

	const script = document.createElement('script');
	script.src = url;
	script.onerror = () => {
		document.getElementById('last-fm-top-tracks').innerHTML =
			'<p style="color: #999;">Unable to load songs</p>';
	};
	document.head.appendChild(script);
}

// Fetch top artists (this week)
function fetchLastFmTopArtists() {
	const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${USERNAME}&api_key=${API_KEY}&limit=8&period=7day&format=json&callback=lastFmTopArtistsCallback`;

	const script = document.createElement('script');
	script.src = url;
	script.onerror = () => {
		document.getElementById('last-fm-artists').innerHTML =
			'<p style="color: #999;">Unable to load artists</p>';
	};
	document.head.appendChild(script);
}

// Display top songs
function displayTopAlbums(tracks) {
	const container = document.getElementById('last-fm-top-tracks');
	container.innerHTML = '';

	const trackArray = Array.isArray(tracks) ? tracks : [tracks];

	trackArray.slice(0, 5).forEach((track, index) => {
		const name = track.name || 'Unknown Song';
		const artistName = track.artist && (track.artist.name || track.artist) ? (track.artist.name || track.artist) : 'Unknown Artist';
		const playcount = track.playcount || '0';

		const trackEl = document.createElement('div');
		trackEl.className = 'track';
		trackEl.innerHTML = `
                        <div style="flex: 1;">
                            <strong>${index + 1}: ${escapeHtml(name)} — ${escapeHtml(artistName)}</strong>
                        </div>
                        <span class="timestamp">${playcount} plays</span>
                    `;

		container.appendChild(trackEl);
	});
}

// JSONP callback for combined digga data
window.diggaCombinedCallback = function (data) {
	// This is handled inside displayTopArtistsGrid
};

// Fetch playcount for a specific artist
async function fetchArtistPlaycount(artistName) {
	return new Promise((resolve) => {
		const callbackName = `artistPlaycountCallback_${Math.random().toString(36).slice(2, 11)}`;
		window[callbackName] = function (data) {
			const artists = data.topartists.artist;
			const artist = Array.isArray(artists) ? artists[0] : artists;
			const playcount = artist ? parseInt(artist.playcount, 10) : 0;
			delete window[callbackName];
			resolve(playcount);
		};

		const script = document.createElement('script');
		script.src = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${USERNAME}&api_key=${API_KEY}&period=7day&format=json&callback=${callbackName}`;
		script.onerror = () => {
			delete window[callbackName];
			resolve(0);
		};
		document.head.appendChild(script);

		setTimeout(() => {
			if (window[callbackName]) {
				delete window[callbackName];
				resolve(0);
			}
		}, 5000);
	});
}

// Fetch playcount for a specific artist in the last 7 days
function fetchSpecificArtistPlaycount(artistName) {
	return new Promise((resolve) => {
		const callbackName = `artistPlaycount_${Math.random().toString(36).slice(2, 11)}`;

		window[callbackName] = function (data) {
			const artists = data.topartists.artist;
			let playcount = 0;

			if (Array.isArray(artists)) {
				const found = artists.find(a => a.name.toLowerCase() === artistName.toLowerCase());
				if (found) {
					playcount = parseInt(found.playcount, 10);
				}
			} else if (artists && artists.name.toLowerCase() === artistName.toLowerCase()) {
				playcount = parseInt(artists.playcount, 10);
			}

			delete window[callbackName];
			resolve(playcount);
		};

		const script = document.createElement('script');
		script.src = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${USERNAME}&api_key=${API_KEY}&period=7day&limit=300&format=json&callback=${callbackName}`;
		script.onerror = () => {
			delete window[callbackName];
			resolve(0);
		};
		document.head.appendChild(script);

		setTimeout(() => {
			if (window[callbackName]) {
				delete window[callbackName];
				resolve(0);
			}
		}, 5000);
	});
}

// Display top artists in grid format
async function displayTopArtistsGrid(artists) {
	const container = document.getElementById('last-fm-artists');
	container.innerHTML = '';

	let artistArray = Array.isArray(artists) ? artists : [artists];

	// Always fetch both digga and digga d's playcounts
	const [diggaPlaycount, diggaDPlaycount] = await Promise.all([
		fetchSpecificArtistPlaycount('Digga'),
		fetchSpecificArtistPlaycount('Digga D')
	]);

	const combinedPlaycount = diggaPlaycount + diggaDPlaycount;

	// Remove both from array if they exist
	artistArray = artistArray.filter(a =>
		a.name.toLowerCase() !== 'digga' && a.name.toLowerCase() !== 'digga d'
	);

	// Add combined Digga D entry
	artistArray.push({
		name: 'Digga D',
		playcount: combinedPlaycount.toString()
	});

	// Sort by playcount descending and limit to 8
	artistArray.sort((a, b) => parseInt(b.playcount, 10) - parseInt(a.playcount, 10));
	artistArray = artistArray.slice(0, 8);

	artistArray.forEach((artist) => {
		const name = artist.name || 'Unknown Artist';
		const playcount = artist.playcount || '0';
		const lastFmUrl = `https://www.last.fm/user/last_aezi/library/music/${encodeURIComponent(name)}?date_preset=LAST_7_DAYS`;

		const artistBox = document.createElement('div');
		artistBox.className = 'friend-box';

		const link = document.createElement('a');
		link.href = lastFmUrl;
		link.target = '_blank';

		const imgContainer = document.createElement('div');
		imgContainer.style.position = 'relative';
		imgContainer.style.width = '100%';
		imgContainer.style.aspectRatio = '1 / 1';
		imgContainer.style.height = 'auto';
		imgContainer.style.backgroundColor = 'transparent';
		imgContainer.style.overflow = 'hidden';
		imgContainer.style.marginBottom = '5px';
		imgContainer.style.display = 'flex';
		imgContainer.style.alignItems = 'center';
		imgContainer.style.justifyContent = 'center';
		imgContainer.style.color = '#999';
		imgContainer.textContent = 'Loading...';

		link.appendChild(imgContainer);

		const nameP = document.createElement('p');
		nameP.innerHTML = `<strong>${escapeHtml(name)}</strong>`;
		link.appendChild(nameP);

		const playsP = document.createElement('p');
		playsP.style.cssText = 'font-size: 0.85em; color: #999;';
		playsP.textContent = `${playcount} plays`;
		link.appendChild(playsP);

		artistBox.appendChild(link);
		container.appendChild(artistBox);

		// Fetch image from Deezer (JSONP) with local fallback
		fetchArtistImage(name, imgContainer, artistBox);
	});
}

// Fetch artist image from Deezer Search API (JSONP, no backend required)
function fetchArtistImage(artistName, container, artistBox) {
	const callbackName = `deezerArtistCallback_${Math.random().toString(36).slice(2, 11)}`;
	const script = document.createElement('script');
	let done = false;

	// Keeps the card structure intact on the dashboard grid layout if images fail
	function handleImageFailure() {
		if (container) {
			container.innerHTML = ''; 
		}
	}

	function normalizeName(value) {
		return (value || '').toLowerCase().trim().replace(/\s+/g, '');
	}

	function slugName(value) {
		return normalizeName(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
	}

	function buildStyledImage(url) {
		const img = document.createElement('img');
		img.src = url;
		img.alt = artistName;
		img.style.width = '100%';
		img.style.height = '100%';
		img.style.maxWidth = '100%';
		img.style.maxHeight = '100%';
		img.style.display = 'block';
		img.style.boxSizing = 'border-box';
		img.style.margin = '0';
		img.style.padding = '0';
		img.style.border = '0';
		img.style.objectFit = 'cover';
		img.style.objectPosition = 'center';
		img.style.backgroundColor = 'transparent';
		return img;
	}

	// --- STEP 2: DEEZER FALLBACK (Runs second if local assets fail) ---
	function tryDeezerFallback() {
		window[callbackName] = function (data) {
			done = true;
			const candidates = data && data.data && data.data.length ? data.data : [];
			const targetName = normalizeName(artistName);
			let imageUrl = '';

			const exactMatch = candidates.find(candidate => normalizeName(candidate.name) === targetName);
			const containsMatch = candidates.find(candidate => normalizeName(candidate.name).includes(targetName) || targetName.includes(normalizeName(candidate.name)));
			const chosen = exactMatch || containsMatch || candidates[0];

			if (chosen) {
				imageUrl = chosen.picture_xl || chosen.picture_big || chosen.picture_medium || '';
			}

			if (imageUrl) {
				const img = buildStyledImage(imageUrl);
				img.onload = () => {
					container.innerHTML = '';
					container.appendChild(img);
				};
				img.onerror = () => {
					handleImageFailure();
				};
			} else {
				handleImageFailure();
			}

			delete window[callbackName];
			script.remove();
		};

		script.src = `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}&output=jsonp&callback=${callbackName}`;
		script.onerror = () => {
			handleImageFailure();
			delete window[callbackName];
			script.remove();
		};
		document.head.appendChild(script);

		setTimeout(() => {
			if (!done) {
				handleImageFailure();
				delete window[callbackName];
				script.remove();
			}
		}, 6000);
	}

	// --- STEP 1: LOCAL PICTURES SEARCH (Runs first using the domain address) ---
	function tryLocalSearch() {
		const normalized = normalizeName(artistName);
		const slug = slugName(artistName);
		const compact = normalized.replace(/[^a-z0-9]/g, '');
		const extraUrl = "https://myspace.aezlo.com";

		const candidates = [
			`${extraUrl}/replacement-pics/${slug}.gif`,
			`${extraUrl}/replacement-pics/${slug}.png`,
			`${extraUrl}/replacement-pics/${slug}.jpg`,
			`${extraUrl}/replacement-pics/${slug}.jpeg`,
			`${extraUrl}/replacement-pics/${slug}.webp`,
			`${extraUrl}/replacement-pics/${compact}.gif`,
			`${extraUrl}/replacement-pics/${compact}.png`,
			`${extraUrl}/replacement-pics/${compact}.jpg`,
			`${extraUrl}/replacement-pics/${compact}.jpeg`,
			`${extraUrl}/replacement-pics/${compact}.webp`
		];

		const uniqueCandidates = Array.from(new Set(candidates));
		let index = 0;

		function tryNext() {
			if (index >= uniqueCandidates.length) {
				tryDeezerFallback(); 
				return;
			}

			const testUrl = uniqueCandidates[index++];
			const img = buildStyledImage(testUrl);
			img.onload = () => {
				container.innerHTML = '';
				container.appendChild(img);
			};
			img.onerror = () => {
				tryNext();
			};
		}

		tryNext();
	}

	// Execution entry point
	tryLocalSearch();
}


// Display tracks
function displayTracks(tracks) {
	const container = document.getElementById('last-fm-recent');
	if (!container) return;
	container.innerHTML = '';

	const trackArray = (Array.isArray(tracks) ? tracks : [tracks]).slice(0, 4);

	trackArray.forEach(track => {
		let artist = 'Unknown Artist';
		if (track.artist) {
			if (typeof track.artist === 'object') {
				artist = track.artist['#text'] || track.artist.name || 'Unknown Artist';
			} else if (typeof track.artist === 'string') {
				artist = track.artist;
			}
		}

		const trackName = track.name || 'Unknown Track';
		const isNowPlaying = track['@attr'] && track['@attr'].nowplaying === 'true';
		const timestamp = isNowPlaying ?
			'now playing' :
			(track.date && track.date.uts ? getRelativeTime(new Date(track.date.uts * 1000)) : 'recently');
		const timestampClass = isNowPlaying ? 'now-playing' : '';

		const trackEl = document.createElement('div');
		trackEl.className = 'track';
		trackEl.innerHTML = `
                        <div style="flex: 1;">
                            <strong>${escapeHtml(artist)}</strong>: ${escapeHtml(trackName)}
                        </div>
                        <span class="timestamp ${timestampClass}">${escapeHtml(timestamp)}</span>
                    `;

		if (isNowPlaying) {
			const timestampSpan = trackEl.querySelector('.timestamp');
			if (timestampSpan) {
				animateNowPlaying(timestampSpan);
			}
		}

		container.appendChild(trackEl);
	});
}

// Helper function to calculate relative time
function getRelativeTime(date) {
	const seconds = Math.floor((new Date() - date) / 1000);
	let interval = seconds / 31536000;

	if (interval > 1) return Math.floor(interval) + ' years ago';
	interval = seconds / 2592000;
	if (interval > 1) return Math.floor(interval) + ' months ago';
	interval = seconds / 86400;
	if (interval > 1) return Math.floor(interval) + ' days ago';
	interval = seconds / 3600;
	if (interval > 1) return Math.floor(interval) + ' hours ago';
	interval = seconds / 60;
	if (interval > 1) return Math.floor(interval) + ' minutes ago';
	return Math.floor(seconds) + ' seconds ago';
}

// Helper function to escape HTML
function escapeHtml(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

// Animate "now playing" with ellipsis
function animateNowPlaying(element) {
	let dotCount = 0;
	setInterval(() => {
		dotCount = (dotCount + 1) % 4;
		element.textContent = 'now playing' + '.'.repeat(dotCount);
	}, 350);
}

document.addEventListener('DOMContentLoaded', () => {
	fetchLastFmTracks();
	fetchLastFmTopAlbums();
	fetchLastFmTopArtists();
});