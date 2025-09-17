document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#add-expense-form"); // Use ID for specific form

    if (form) { // Ensure form exists before adding event listener
        form.addEventListener("submit", (e) => {
            e.preventDefault(); // Prevent full page reload

            const amount = form.amount.value;
            const category = form.category.value;
            const description = form.description.value;
            // Date is handled by the server for consistency

            // Send data to backend via fetch()
            fetch("/dashboard", { // POST to the dashboard route
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    amount: amount,
                    category: category,
                    description: description,
                }).toString(),
            })
            .then(response => response.text()) // Get the response text (which might be the rendered HTML if redirected)
            .then(() => {
                // After successful submission, refresh the page to show new expense
                // Alternatively, you could fetch expenses and update table dynamically with JSON
                window.location.reload(); 
            })
            .catch(error => console.error("Error adding expense:", error));

            form.reset(); // Clear form
        });
    }
});