// ==UserScript==
// @name         Support Site - Restore Answer
// @namespace    https://support.yardinternet.nl/
// @version      1.6
// @description  Adds a "Restore answer" button to display a popup for restoring textarea input, with content saved to localStorage.
// @author       WB
// @match        https://support.yardinternet.nl/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/WybeBosch/support-restore-answer/main/restore-answer.user.js
// @updateURL    https://raw.githubusercontent.com/WybeBosch/support-restore-answer/main/restore-answer.user.js
// ==/UserScript==

(function () {
	"use strict";

	function init() {
		console.log("%c [YARD LOG] Function: ~ init", "color:#B182D1");
		listenToInputArea();
		createPopupHTML();
		appendStyles();
		addEventListeners();
		removeSavedDataOlderThan({ keepDataForXDays: 1 });
	}

	function listenToInputArea() {
		console.log("%c [YARD LOG] Function: ~ listenToInputArea", "color:#B182D1");
		document.addEventListener("keyup", (e) => {
			if (e.target.name === "antwoord" && e.target.value.trim() !== "") {
				const uniqueFormId = e.target.closest("div[id]").id;
				const dataToSave = {
					value: e.target.value,
					timestamp: new Date().toISOString(),
				};
				localStorage.setItem(uniqueFormId, JSON.stringify(dataToSave));
			}
		});
	}

	const createPopupHTML = () => {
		console.log("%c [YARD LOG] Function: ~ createPopupHTML", "color:#B182D1");
		const popupHtml = /* html */ `
		<div class="wb-restore-popup" style="display: none;">
			<h1>Restore saved input</h1>
			<div class="wb-restore-btn-wrapper">
				<button class="wb-restore-popup-close">Close</button>
				<button class="wb-restore-button-accept">Accept</button>
			</div>
			<div class="wb-restore-popup-content"></div>
		</div>
		<button class="wb-restore-button" style="display:none;">Restore answer</button>
	`;
		document.body.insertAdjacentHTML("beforeend", popupHtml);
	};

	const appendStyles = () => {
		console.log("%c [YARD LOG] Function: ~ appendStyles", "color:#B182D1");
		const styles = /* css */ `
            .wb-restore-popup {
                position: fixed;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                background-color: white;
                padding: 20px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                z-index: 10001;
                text-align: center;
                min-width: 600px;
                min-height: 300px;
                flex-direction: column;
            }

            .wb-restore-popup h1 {
                margin-bottom: 20px;
                font-weight: bold;
            }

            .wb-restore-btn-wrapper {
                margin-bottom: 20px;
            }

            .wb-restore-popup-close, .wb-restore-button-accept {
                padding: 5px 10px;
                cursor: pointer;
                margin-right: 15px;
            }

            .wb-restore-popup-close:last-child {
                margin-right: 0;
            }

            .wb-restore-popup-content {
                background-color: lightgrey;
                padding: 10px;
                margin-bottom: 20px;
            }
			
            .wb-restore-button {
                position: fixed;
                left: 10px;
                bottom: 10px;
                z-index: 10000;
                padding: 5px 10px;
                cursor: pointer;
            }

			.wb-restore-button {
				display:block !important;
				position: fixed;
				left: 10px;
				bottom: 10px;
				z-index: 10000;
				padding: 5px 10px;
				cursor: pointer;
			}
        `;

		const styleSheet = document.createElement("style");
		styleSheet.innerText = styles;
		document.head.appendChild(styleSheet);
	};

	function addEventListeners() {
		console.log("%c [YARD LOG] Function: ~ appendStyles", "color:#B182D1");
		const popup = document.querySelector(".wb-restore-popup");
		const closeButton = popup.querySelector(".wb-restore-popup-close");
		const acceptButton = popup.querySelector(".wb-restore-button-accept");
		const openPopup = document.querySelector(".wb-restore-button");

		acceptButton.onclick = () => {
			window.restoreinput(true); // Pass true to indicate acceptance
			popup.style.display = "none";
		};

		closeButton.onclick = () => (popup.style.display = "none");

		openPopup.onclick = () => {
			console.log("List of currently saved input backups:");
			console.table(window.localStorage);
			fillPopupWithInfo();
			showPopup();
		};
	}

	function showPopup() {
		let popup = document.querySelector(".wb-restore-popup");
		popup.style.display = "flex";
	}

	function fillPopupWithInfo() {
		// Fill the popup with the saved data from localstorage
		// There will only be 1 open at a time, so we can just get the first one
		const textareas = document.querySelectorAll('textarea[name="antwoord"]');
		const popupFillLocation = document.querySelector(
			".wb-restore-popup-content"
		);

		const popup = document.querySelector(".wb-restore-popup");
		textareas.forEach((textarea) => {
			const uniqueFormId = textarea.closest("div[id]").id;
			const savedData = localStorage.getItem(uniqueFormId);
			if (savedData) {
				const { value } = JSON.parse(savedData);
				if (value && value.trim() !== "") {
					popupFillLocation.textContent = value;
				}
			}
		});
	}

	function removeSavedDataOlderThan({ keepDataForXDays = 0 }) {
		console.log(
			"%c [YARD LOG] Function: ~ removeSavedDataOlderThan",
			"color:#B182D1"
		);
		const keys = Object.keys(localStorage);
		const now = new Date();

		keys.forEach((key) => {
			if (key.includes("-add-answer-form")) {
				// Ensure we only target specific keys
				const data = JSON.parse(localStorage.getItem(key));
				if (data && data.timestamp) {
					const savedDate = new Date(data.timestamp);
					let diffTime = Math.abs(now - savedDate);
					let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

					if (keepDataForXDays === 0) {
						// If days is 0, adjust criteria to remove items older than 1 minute
						diffTime = Math.abs(now - savedDate) / (1000 * 60); // Convert to minutes
						if (diffTime > 1) {
							console.log(
								`Removing item with key ${key} as it's older than 1 minute`
							);
							console.log(localStorage.getItem(key));
							localStorage.removeItem(key);
						}
					} else {
						if (diffDays > keepDataForXDays) {
							console.log(
								`Removing item with key ${key} as it's older than ${keepDataForXDays} days`
							);
							console.log(localStorage.getItem(key));
							localStorage.removeItem(key);
						}
					}
				}
			}
		});
	}

	window.restoreinput = function (accept = false) {
		console.log("%c [YARD LOG] Function: ~ restoreinput", "color:#B182D1");

		let contentToRestore = "No content found to restore.";
		const textareas = document.querySelectorAll('textarea[name="antwoord"]');
		textareas.forEach((textarea) => {
			const uniqueFormId = textarea.closest("div[id]").id;
			const savedData = localStorage.getItem(uniqueFormId);
			if (savedData) {
				const { value } = JSON.parse(savedData);
				if (value && value.trim() !== "") {
					contentToRestore = value;
					if (accept) {
						textarea.value = value; // Restore the content if accept is true
					}
				}
			}
		});

		let popup = document.querySelector(".wb-restore-popup");
		let popupContent = popup.querySelector(".wb-restore-popup-content");
		if (!accept) {
			// Only show the popup if not accepting directly
			popupContent.textContent = contentToRestore; // Only show the content if not accepting directly
			popup.style.display = "flex"; // Use flex display when showing the popup
		}
	};

	init();
})();
