function refreshCopies(event) {
    fetch("/api/update-copies", {
        method: "POST",
    });
}
