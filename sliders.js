var numberInputs = document.querySelectorAll("input[type=number]");
for (var nuin of numberInputs) {
    var row = nuin.parentElement.parentElement;
    var tr = document.createElement("tr");
    row.insertAdjacentElement("afterend", tr);
    var td = document.createElement("td");
    td.setAttribute("colspan", 2);
    tr.appendChild(td);
    var slider = document.createElement("input");
    slider.setAttribute("type", "range");
    slider.setAttribute("value", nuin.getAttribute("value"));
    slider.setAttribute("min", nuin.getAttribute("min"));
    slider.setAttribute("max", nuin.getAttribute("max"));
    slider.setAttribute("step", nuin.getAttribute("step"));
    td.appendChild(slider);
    slider.addEventListener("input", new Function(`document.getElementById("${nuin.id}").value=this.value`));
}