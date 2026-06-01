const contactForm = document.getElementById("contactForm");
const bookingForm = document.getElementById("bookingForm");

async function sendSubmission(url, payload, form, successText) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Submission failed.");
    }

    alert(result.message || successText);
    form.reset();
  } catch (error) {
    console.error(error);
    alert(error.message || "Unable to submit the form. Please try again later.");
  }
}

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("contactName").value,
      email: document.getElementById("contactEmail").value,
      subject: document.getElementById("contactSubject").value,
      message: document.getElementById("contactMessage").value,
    };

    sendSubmission("http://localhost:5000/contact", data, contactForm, "Thank you! Your message has been sent.");
  });
}

if (bookingForm) {
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("bookingName").value,
      email: document.getElementById("bookingEmail").value,
      phone: document.getElementById("bookingPhone").value,
      preferred_date: document.getElementById("bookingPreferred").value,
      topic: document.getElementById("bookingTopic").value,
      message: document.getElementById("bookingMessage").value,
    };

    sendSubmission("http://localhost:5000/booking", data, bookingForm, "Thank you! Your consultation request has been sent.");
  });
}
