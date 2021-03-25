const loadPrograms = () => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = "text/json";

        xhr.onload = () => {
            resolve(JSON.parse(xhr.response));
        };

        xhr.onerror = (e) => {
            console.error(e);
            reject([]);
        }
        
        xhr.open("GET", "/api/programs");
        xhr.send();
    });
};

window.onload = () => {
    loadPrograms().then((programs) => {
        const pc = document.getElementById("programsContainer");

        for (const program of programs) {
            const frame = document.createElement("iframe");
            frame.setAttribute("src", program + "/index.html");
            frame.setAttribute("width", "640");
            frame.setAttribute("height", "500");
            pc.appendChild(frame);
        }
    });
}



