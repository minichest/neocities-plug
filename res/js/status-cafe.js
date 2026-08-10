// Fetches your live status data safely from your native host folder
fetch("./status.json")
    .then(r => r.json())
    .then(r => {
        const usernameEl = document.getElementById("statuscafe-username");
        const contentEl = document.getElementById("statuscafe-content");

        if (!usernameEl || !contentEl) return; // Exit safely if elements aren't ready on screen

        if (!r.content || !r.content.length) {
            contentEl.innerHTML = "No status yet.";
            return;
        }

        // Drops the variables directly into your hardcoded layout card boxes
        usernameEl.innerHTML = '<a href="https://status.cafe/users/aezi" target="_blank">' + r.author + '</a> ' + r.face + ' ' + r.timeAgo;
        contentEl.innerHTML = r.content;
    })
    .catch(err => {
        console.error("Error reading automated status.json file:", err);
        document.getElementById("statuscafe-content").innerHTML = "Status momentarily offline.";
    });
