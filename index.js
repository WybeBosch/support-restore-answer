// ==UserScript==
// @name         Enhanced Save & Restore Textarea Input with Popup Styling and Toggle
// @namespace    http://tampermonkey.net/
// @version      2024-03-29
// @description  Adds a "Restore answer" button to display a custom styled popup for restoring textarea input, with content saved to localStorage.
// @author       You
// @match        https://support.yardinternet.nl/*
// @grant        none
// @downloadURL https://raw.githubusercontent.com/WybeBosch/support-restore-answer/main/index.js
// @updateURL https://raw.githubusercontent.com/WybeBosch/support-restore-answer/main/index.js
// ==/UserScript==

(function () {
	"use strict";

	document.addEventListener("keyup", (e) => {
		if (e.target.name === "antwoord") {
			const uniqueFormId = e.target.closest("div[id]").id;
			const dataToSave = {
				value: e.target.value,
				timestamp: new Date().toISOString(),
			};
			localStorage.setItem(uniqueFormId, JSON.stringify(dataToSave));
		}
	});

	const createPopup = () => {
		const popup = document.createElement("div");
		popup.className = "wb-restore-popup";
		Object.assign(popup.style, {
			position: "fixed",
			left: "50%",
			top: "50%",
			transform: "translate(-50%, -50%)",
			backgroundColor: "white",
			padding: "20px",
			boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
			zIndex: "10001",
			textAlign: "center",
			minWidth: "600px",
			minHeight: "300px",
			display: "none", // Initially hidden
			flexDirection: "column",
		});

		const title = document.createElement("h1");
		title.textContent = "Restore saved input";
		title.style.marginBottom = "20px";
		title.style.fontWeight = "bold";

		const btnWrapper = document.createElement("div");
		btnWrapper.className = "wb-restore-btn-wrapper";
		btnWrapper.style.marginBottom = "20px";

		const closeButton = document.createElement("button");
		closeButton.className = "wb-restore-popup-close";
		closeButton.textContent = "Close";
		closeButton.style.cssText =
			"margin-right: 15px; padding: 5px 10px; cursor: pointer;";

		const acceptButton = document.createElement("button");
		acceptButton.className = "wb-restore-button";
		acceptButton.textContent = "Accept";
		acceptButton.style.cssText = "padding: 5px 10px; cursor: pointer;";

		closeButton.onclick = acceptButton.onclick = () =>
			(popup.style.display = "none");

		const contentPlaceholder = document.createElement("div");
		contentPlaceholder.className = "wb-restore-popup-content";
		contentPlaceholder.style.cssText =
			"background-color: lightgrey; padding: 10px; margin-bottom: 20px;";

		btnWrapper.appendChild(closeButton);
		btnWrapper.appendChild(acceptButton);

		popup.appendChild(title);
		popup.appendChild(btnWrapper);
		popup.appendChild(contentPlaceholder);

		document.body.appendChild(popup);

		return { popup, contentPlaceholder };
	};

	const { popup, contentPlaceholder } = createPopup();

	window.restoreinput = function (accept = false) {
		let contentToRestore = "No content found to restore.";
		const textareas = document.querySelectorAll('textarea[name="antwoord"]');
		textareas.forEach((textarea) => {
			const uniqueFormId = textarea.closest("div[id]").id;
			const savedData = localStorage.getItem(uniqueFormId);
			if (savedData) {
				const { value } = JSON.parse(savedData);
				if (value !== null) {
					contentToRestore = value;
				}
			}
		});

		contentPlaceholder.textContent = contentToRestore;
		if (!accept) {
			// Only show popup if not accepting directly
			popup.style.display = "flex"; // Use flex display when showing the popup
		}
	};

	const restoreButton = document.createElement("button");
	restoreButton.className = "wb-restore-button";
	restoreButton.textContent = "Restore answer"; // Updated button text
	restoreButton.style.cssText =
		"position: fixed; left: 10px; bottom: 10px; z-index: 10000; padding: 5px 10px; cursor: pointer;";
	restoreButton.onclick = () => window.restoreinput();

	document.body.appendChild(restoreButton);
})();
