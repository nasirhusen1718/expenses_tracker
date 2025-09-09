document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent full page reload

        const amount = form.amount.value;
        const category = form.category.value;
        const description = form.description.value;
        const date = new Date().toISOString().split("T")[0];

        // Add row to table dynamically
        const table = document.querySelector("table");
        const newRow = table.insertRow(-1);
        newRow.insertCell(0).innerText = date;
        newRow.insertCell(1).innerText = category;
        newRow.insertCell(2).innerText = amount;
        newRow.insertCell(3).innerText = description;

        // Optionally, send data to backend via fetch() here

        form.reset(); // Clear form
    });
});
