const getAllSoundOptions = async () => {
	const result = await sendRequest("Soundboard", { list: true });
	return result.msg.tracks;
}

const bgColors = ["#b6203a", "#BC3640", "#DD7A43", "#BDB669", "#FAE0B0"];
const fgColors = ["#ffffff", "#ffffff", "#eeeeee", "#444444", "#444444"];

const updateSoundList = async () => {
	const listOfTracks = await getAllSoundOptions();

	const selectElement = document.getElementById("sound");

	for (const child of selectElement.children) {
		child.remove();
	}


	let i = 0;
	for (const track of listOfTracks) {
		const child = document.createElement("button");
		child.className = "soundbutton";
		child.textContent = track;

		child.onclick = () => {
			sendRequest("Soundboard", { play: child.textContent });
		};

		child.style.backgroundColor = bgColors[i % bgColors.length]
		child.style.color = fgColors[i % fgColors.length]
		i++

		selectElement.appendChild(child);
	}
}

const playSound = () => {
	const selectElement = document.getElementById("sound");

	sendRequest("Soundboard", { play: selectedChild.textContent });
}

window.onload = updateSoundList;
