var numberInputs = document.querySelectorAll("input[type=number]");
for (var nuin of numberInputs) {
    var slider = document.createElement("input");
    slider.setAttribute("type", "range");
    slider.setAttribute("min", nuin.getAttribute("min"));
    slider.setAttribute("max", nuin.getAttribute("max"));
    slider.setAttribute("step", nuin.getAttribute("step"));
    slider.setAttribute("value", nuin.getAttribute("value"));
    nuin.insertAdjacentElement("beforebegin", slider);
    slider.dataset.ID = nuin.id;
    slider.addEventListener("input", function() {
        document.getElementById(this.dataset.ID).value = this.value;
    });
    slider.addEventListener("input", function() {
        var evt = new Event("input");
        document.getElementById(this.dataset.ID).dispatchEvent(evt); // extreme value theorem
    });
    slider.style.accentColor = "var(--special-color)";
    slider.style.width = "69px";
    slider.style.marginRight = "5px";
    slider.parentElement.style.width = "143px";
    nuin.addEventListener("input", (function() {
        this.slider.value = this.nuin.value;
    }).bind({nuin:nuin,slider:slider}));
}