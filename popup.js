document.getElementById("extractEmail").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: extractEmail,
        args: [tabs[0].url],
      },
      (result) => {
        if (result && result[0]) {
          document.getElementById("email").textContent =
            "Email: " + result[0].result;
        } else {
          document.getElementById("email").textContent = "No email found!";
        }
      }
    );
  });
});

async function extractEmail(url) {
  let email = "";
  let firstName = "";
  let lastName = "";
  let website = "";

  // Extract name
  const nameElement = document.querySelector(".text-heading-xlarge");
  if (nameElement) {
    const fullName = nameElement.textContent.trim();
    const nameParts = fullName.trim().split(" ");

    // First name is everything before the last part
    firstName = nameParts.slice(0, nameParts.length - 1).join(" ");

    // Last name is the last part
    lastName = nameParts[nameParts.length - 1];
  } else {
    firstName = "";
    lastName = "";
  }

  // Find all the h3 headers within the contact-info section
  const headers = Array.from(
    document.querySelectorAll(".pv-contact-info__contact-type h3")
  );

  // Find the header with the text "Email"
  const emailHeader = headers.find((header) =>
    header.textContent.includes("Email")
  );

  // Extract website
  const websiteSection = Array.from(
    document.querySelectorAll(".pv-contact-info__contact-type h3")
  ).find((header) => header.textContent.includes("Website"));

  if (websiteSection) {
    const websiteLink = websiteSection
      .closest(".pv-contact-info__contact-type")
      .querySelector("a.pv-contact-info__contact-link");

    if (websiteLink) {
      website = websiteLink.href.trim();
    } else {
      website = "";
    }
  } else {
    website = "";
  }
  // Log results

  console.log("website", website, firstName, lastName);

  if (!emailHeader && website !== "") {
    // No email found in DOM, fallback to Hunter.io API
    const urlIs = new URL(url);
    urlIs.hostname.replace("www.", "");
    const HUNTER_API_KEY = "b7401a3b94a20405875097f4fd1a6d8a909e04b1"; // Replace with your API key
    const urlPath = `https://api.hunter.io/v2/email-finder?domain=${
      website === "" ? urlIs : website
    }&first_name=${firstName}&last_name=${lastName}&api_key=${HUNTER_API_KEY}`;

    const response = await fetch(urlPath);
    const responseData = await response.json();

    if (responseData.data.email) {
      email = responseData.data.email; // Use the email from the API
    } else {
      email = "No email found.";
    }
  } else {
    // Extract email from LinkedIn DOM
    const emailLink = emailHeader
      .closest(".pv-contact-info__contact-type")
      .querySelector("div a");

    if (emailLink) {
      email = emailLink.textContent.trim();
    } else {
      email = "Email link not found.";
    }
  }

  // If an email is found, make a POST request to your backend API
  if (
    email &&
    email !== "No email found." &&
    email !== "Email link not found."
  ) {
    try {
      const response = await fetch("http://localhost:3000/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }), // Send the extracted email
      });

      const result = await response.json();
      console.log("Response from backend:", result);
    } catch (error) {
      console.error("Error sending POST request:", error);
    }
  }

  return email;
}
