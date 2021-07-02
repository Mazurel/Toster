const getAllSoundOptions = async () => {
    const result = await sendRequest("Soundboard", { list: true });
    return result.msg.tracks;
}

const updateSoundList = async () => {
    const listOfTracks = await getAllSoundOptions();

    const selectElement = document.getElementById("sound");

    for (const child of selectElement.children) {
	child.remove();
    }


    for (const track of listOfTracks) {
	const child = document.createElement("option");
	child.textContent = track;

	selectElement.appendChild(child);
    }
}

const playSound = () => {
    const selectElement = document.getElementById("sound");

    const selectedChild = selectElement.children[selectElement.selectedIndex];

    sendRequest("Soundboard", { play: selectedChild.textContent });
}

window.onload = updateSoundList;
