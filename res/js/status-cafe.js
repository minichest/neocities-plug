// Routes the blocked status.cafe endpoint through a safe, open domain proxy link wrapper
fetch("https://allorigins.win/get?url=" + encodeURIComponent("https://status.cafe/users/aezi/status.json"))
    .then(response => {
        if (response.ok) return response.json();
        throw new Error('Proxy connection dropped.');
    })
    .then(data => {
        // AllOrigins returns the raw text payload nested cleanly inside a .contents property key
        const r = JSON.parse(data.contents);
        
        const usernameEl = document.getElementById("statuscafe-username");
        const contentEl = document.getElementById("statuscafe-content");

        if (!usernameEl || !contentEl) return; // Safety check

        if (!r.content || !r.content.length) {
            contentEl.innerHTML = "No status yet.";
            return;
        }

        // Safely parses your custom variables into your hardcoded markup grid
        usernameEl.innerHTML = '<a href="https://status.cafe/users/aezi" target="_blank">' + r.author + '</a> ' + r.face + ' ' + r.timeAgo;
        contentEl.innerHTML = r.content;
    })
    .catch(err => {
        console.error("Mirror read failure exception:", err);
        document.getElementById("statuscafe-content").innerHTML = "Status momentarily offline.";
    });
