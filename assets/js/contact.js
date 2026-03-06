document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("contactStatus");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Sending...";

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      company: form.company.value.trim(),
      phone: form.phone.value.trim(),
      message: form.message.value.trim()
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      form.reset();
      status.textContent = "Message sent. We'll be in touch shortly.";
    } catch (error) {
      status.textContent = "Unable to send right now. Please try again.";
    }
  });
});
