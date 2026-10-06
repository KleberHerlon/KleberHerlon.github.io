
document.querySelector("form").addEventListener("submit", function(event) {
    document.querySelector("form").style.display = "none";
    document.querySelector("#success-message").style.display = "block";
    submitAnswers();
});