const buttonElement = document.querySelector("button")
buttonElement.addEventListener("click", function() {
    chrome.tabs.create({ url: "options.html" })
})