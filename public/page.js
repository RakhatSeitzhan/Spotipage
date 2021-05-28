/*
1) personal information
2) Favorite albums and songs
3) Favorite singers
4) Favorite music styles
5) Suggested songs and artists
*/
// Enlargen top 3 tracks, add "other loved tracks" and list them
//let profileInfo
import bar from './d3.js'
let tracksList = []
let profileInfo = null
let tracksInfo = null
let artistsInfo = null
let tracksData = null

function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

var params = getHashParams();
var access_token = params.access_token
var refresh_token = params.refresh_token
var error = params.error;

if (error) {
    alert('There was an error during the authentication');
} else {
    if (access_token) {
        profileInfo = await getProfile(access_token)
        makeProfileElement(profileInfo)

        tracksInfo = await getTracks(access_token)
        makeTrackElement(tracksInfo)
        tracksList = tracksInfo.items.map(item => item.id)

        artistsInfo = await getArtists(access_token)
        makeArtistsElement(artistsInfo)

        tracksData = await getAudioFeatures(access_token)
        //const somedata = await getAnalysis(tracksData.audio_features[0].analysis_url, access_token)
        //const somedata2 = await getAnalysis2(tracksData.audio_features[0].id, access_token)
        const processedData = handleTrackData(tracksData)
        bar(processedData, '#tracks-stats')
        
        const genres = handleGenres(artistsInfo)
        bar(genres, '#genres-stats')

        const recommendations = await getRecommendations(access_token)
        makeRecommendationsElement(recommendations)
    } else {
        // render initial screen
    } 
}

async function getAudioFeatures(token){
    return $.ajax({
        url: 'https://api.spotify.com/v1/audio-features',
        headers: {'Authorization': 'Bearer ' + token},
        data:{
            'ids': tracksList.join(',')
        }
    })
}

async function getProfile(token){
    return $.ajax({
        url: 'https://api.spotify.com/v1/me',
        headers: {'Authorization': 'Bearer ' + token}
    });
}
function makeProfileElement(response){
    document.getElementById('profile-image').src = response.images[0].url
    document.getElementById('profile-name').innerHTML = response.display_name
    document.getElementById('profile-data').innerHTML = 'Followers '+response.followers.total
}

async function getTracks(token){
    return $.ajax({
        url: 'https://api.spotify.com/v1/me/top/tracks?limit=50',
        headers: {'Authorization': 'Bearer ' + token},
    })
}
function makeTrackElement(response){
    let space = 1
    let c = 0
    let row = document.createElement('div')
    row.className = "row"
    response.items.slice(0,7).forEach(track => {
        const element = document.createElement('div')
        const image = document.createElement('img')
        const title = document.createElement('div')
        const artist = document.createElement('div')
        image.className = "track-image"
        image.src = track.album.images[0].url
        title.innerHTML = track.name
        title.className = "track-name"
        artist.innerHTML = track.artists[0].name
        artist.className = "track-artist"
        element.appendChild(title)
        element.appendChild(artist)
        element.appendChild(image)
        element.className = "track"
        row.appendChild(element)
        c++
        if (space==c){
            document.getElementById('tracks').appendChild(row)
            row = document.createElement('div')
            row.className = "row"
            space++
            c=0
        }
    })
}

async function getArtists(token){
    return $.ajax({
        url: 'https://api.spotify.com/v1/me/top/artists?limit=50',
        headers: {'Authorization': 'Bearer ' + token}
    })
}

function makeArtistsElement(response){
    let space = 1
    let c = 0
    let row = document.createElement('div')
    row.className = "row"
    response.items.slice(0,7).forEach(artist => {
        const element = document.createElement('div')
        const image = document.createElement('img')
        const name = document.createElement('div')
        const data = document.createElement('div')
        image.className = "artist-image"
        image.src = artist.images[0].url
        name.innerHTML = artist.name
        name.className = "artist-name"
        data.innerHTML = artist.followers.total
        data.className = "artist-data"
        element.appendChild(name)
        element.appendChild(data)
        element.appendChild(image)
        element.className = "artist"
        row.appendChild(element)
        c++
        if (space==c){
            document.getElementById('artists').appendChild(row)
            row = document.createElement('div')
            row.className = "row"
            space++
            c=0
        }
    })
}

function handleTrackData(data){
    const types = ['acousticness','danceability','energy','instrumentalness','liveness','speechiness','valence']
    const colors = ['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c','#F396DE','#F5EB54']
    const descriptions = [
        'Describes how acoustic a song is',
        'Describes how suitable a track is for dancing',
        'Describes intensity and activity. Energetic tracks feel fast, loud, and noisy',
        'Describes the amount of vocals in the song',
        'Describes the probability that the song was recorded with a live audience',
        'Describes the presence of spoken words in a track',
        'Describes the musical positiveness conveyed by a track'
    ]
    let summed = {}
    let sum = 0
    data.audio_features.forEach(trackInfo => {
        for (var prop in trackInfo){
            if (types.indexOf(prop)>= 0){
                if (summed[prop]==null) summed[prop] = 0
                else summed[prop]+= Number(trackInfo[prop])
                summed[prop] = Math.round(summed[prop]*100)/100
            }
        }
    })
    for (var prop in summed){
        sum+=summed[prop]
    }
    return types.map((title, index) => {
        return {
            name: title,
            value: Math.round(summed[title]/sum*100),
            color: colors[index],
            description: descriptions[index]
        }
    })
}

async function getAnalysis(url, token){
    console.log(url)
    $.ajax({
        url: url,
        headers: {'Authorization': 'Bearer ' + token}
    })
}

function handleGenres(artists){
    let sum = {}
    let summed = 0
    artists.items.forEach(artist => {
        artist.genres.forEach(genre => {
            if (sum[genre]==null) sum[genre] = 1
            else sum[genre] += 1
            summed++
        })
    })
    let res = []
    for(var key in sum){
        res.push({name: key, value: Math.round(sum[key]/summed*100)})
    }
    return res
}

async function getRecommendations(token){
    return $.ajax({
        url: 'https://api.spotify.com/v1/recommendations',
        headers: {'Authorization': 'Bearer ' + token},
        data: {
            seed_tracks: tracksList.slice(0,5).join(','),
            limit: 10
        }
    })
}

function makeRecommendationsElement(response){
    let space = 1
    let c = 0
    let row = document.createElement('div')
    row.className = "row"
    response.tracks.slice(0,7).forEach(track => {
        const element = document.createElement('div')
        const image = document.createElement('img')
        const title = document.createElement('div')
        const artist = document.createElement('div')
        image.className = "track-image"
        image.src = track.album.images[0].url
        title.innerHTML = track.name
        title.className = "track-name"
        artist.innerHTML = track.artists[0].name
        artist.className = "track-artist"
        element.appendChild(title)
        element.appendChild(artist)
        element.appendChild(image)
        element.className = "track"
        row.appendChild(element)
        c++
        if (space==c){
            document.getElementById('recommendations').appendChild(row)
            row = document.createElement('div')
            row.className = "row"
            space++
            c=0
        }
    })
}