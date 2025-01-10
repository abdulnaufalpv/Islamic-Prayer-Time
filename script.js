document.getElementById('get-location').addEventListener('click', getLocation);

document.getElementById('search-location-btn').addEventListener('click', searchLocation);

let apiKey = '2ef27a3c0c824f1cb1181b9855cf52bf'; // OpenCage API Key

let currentLocation = null;

// Auto-detect location

function getLocation() {

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(function(position) {

            const latitude = position.coords.latitude;

            const longitude = position.coords.longitude;

            currentLocation = { latitude, longitude };

            fetchPrayerTimes(latitude, longitude); // Fetch prayer times

            displayCoordinates(latitude, longitude); // Display location coordinates and map link

        }, function(error) {

            alert("Unable to retrieve location.");

        });

    } else {

        alert("Geolocation not supported.");

    }

}

// Search location by name

function searchLocation() {

    const location = document.getElementById('search-location').value;

    if (location) {

        fetchLocationByName(location);

    }

}

// Fetch location details by city name

function fetchLocationByName(cityName) {

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${cityName}&key=${apiKey}`;

    fetch(url)

        .then(response => response.json())

        .then(data => {

            if (data.results && data.results.length > 0) {

                const { lat, lng } = data.results[0].geometry;

                currentLocation = { latitude: lat, longitude: lng };

                fetchPrayerTimes(lat, lng);

                displayCoordinates(lat, lng); // Display location coordinates and map link

            } else {

                alert('Location not found!');

            }

        })

        .catch(error => {

            console.error('Error fetching location data:', error);

            alert('Error fetching location data!');

        });

}

// Fetch prayer times based on coordinates

function fetchPrayerTimes(latitude, longitude) {

    const method = 2; // Calculation method

    const url = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=${method}`;

    fetch(url)

        .then(response => response.json())

        .then(data => {

            if (data.data && data.data.timings) {

                displayPrayerTimes(data.data.timings);

                highlightUpcomingPrayer(data.data.timings);

            } else {

                console.error('Error fetching prayer times data:', data);

            }

        })

        .catch(error => {

            alert("Error fetching prayer times.");

            console.error(error);

        });

}

// Display prayer times

function displayPrayerTimes(times) {

    if (times) {

        // Format and display prayer times

        document.getElementById('fajr-time-value').textContent = formatTime(times.Fajr);

        document.getElementById('dhuhr-time-value').textContent = formatTime(times.Dhuhr);

        document.getElementById('asr-time-value').textContent = formatTime(times.Asr);

        document.getElementById('maghrib-time-value').textContent = formatTime(times.Maghrib);

        document.getElementById('isha-time-value').textContent = formatTime(times.Isha);

        const jummaTime = times.Dhuhr;

        document.getElementById('jumma-time-value').textContent = jummaTime ? formatTime(jummaTime) : "Not Available";

        document.getElementById('prayer-times-container').style.display = "block";

    }

}

// Format time to 12-hour AM/PM format

function formatTime(time) {

    const [hour, minute] = time.split(':');

    let hours = parseInt(hour);

    const suffix = hours >= 12 ? 'PM' : 'AM';

    

    hours = hours % 12;

    hours = hours ? hours : 12; // 0 should be 12

    return `${hours}:${minute} ${suffix}`;

}

// Highlight the upcoming prayer and show countdown

function highlightUpcomingPrayer(times) {

    const currentTime = new Date();

    const prayerTimes = [

        { name: "Fajr", time: times.Fajr },

        { name: "Dhuhr", time: times.Dhuhr },

        { name: "Asr", time: times.Asr },

        { name: "Maghrib", time: times.Maghrib },

        { name: "Isha", time: times.Isha }

    ];

    let nextPrayer = null;

    for (let prayer of prayerTimes) {

        const prayerTime = new Date(currentTime);

        const [hour, minute] = prayer.time.split(":");

        prayerTime.setHours(hour, minute, 0, 0);

        if (prayerTime > currentTime) { // If the prayer time is after current time

            nextPrayer = prayer;

            break;

        }

    }

    if (nextPrayer) {

        document.getElementById('next-prayer').textContent = `Next Prayer: ${nextPrayer.name} at ${formatTime(nextPrayer.time)}`;

        countdownToNextPrayer(nextPrayer.time);

    } else {

        document.getElementById('next-prayer').textContent = "No more prayers today.";

    }

}

// Countdown to next prayer

function countdownToNextPrayer(prayerTime) {

    const targetTime = new Date();

    const [hour, minute] = prayerTime.split(":");

    targetTime.setHours(hour, minute, 0, 0);

    const interval = setInterval(function() {

        const now = new Date();

        const remainingTime = targetTime - now;

        if (remainingTime <= 0) {

            clearInterval(interval);

            document.getElementById('countdown-time').textContent = "00:00:00"; // Prayer time reached

        } else {

            const hoursRemaining = Math.floor(remainingTime / 3600000);

            const minutesRemaining = Math.floor((remainingTime % 3600000) / 60000);

            const secondsRemaining = Math.floor((remainingTime % 60000) / 1000);

            document.getElementById('countdown-time').textContent = `${padZero(hoursRemaining)}:${padZero(minutesRemaining)}:${padZero(secondsRemaining)}`;

        }

    }, 1000);

}

function padZero(num) {

    return num < 10 ? "0" + num : num;

}

// Display latitude, longitude, and a link to the map

function displayCoordinates(latitude, longitude) {

    // Display coordinates

    document.getElementById('location-name').textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;

    

    // Generate map link

    const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    document.getElementById('location-link').innerHTML = `<a href="${mapLink}" target="_blank">View Location on Map</a>`;

}

// Update date and time

function updateDateTime() {

    const currentDate = new Date();

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };

    document.getElementById('current-date-time').textContent = currentDate.toLocaleDateString('en-US', dateOptions);

    document.getElementById('current-time').textContent = currentDate.toLocaleTimeString('en-US', timeOptions);

}

setInterval(updateDateTime, 1000); // Update every second

updateDateTime(); // Call the function initially to display the time
