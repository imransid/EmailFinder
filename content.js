// Extract email directly from the LinkedIn profile if available
function findEmail() {
  let email = "";
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

  // Check if the email is displayed on the page
  const emailElement = document.querySelector(
    ".pv-contact-info__contact-item--email a"
  );
  if (emailElement) {
    email = emailElement.innerText.trim();
  }

  return email;
}

// Make the extracted email available to the popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getEmail") {
    const email = findEmail();
    sendResponse({ email: email });
  }
});
