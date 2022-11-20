if ((new URLSearchParams(location.search)).get("isPhotopeaPlugin") == "yessir") {
    //document.querySelector("#uploadButton").style.display = "none";
    document.querySelector("#exportpanel").innerHTML = "";
    var finishButton = document.createElement("button");
    finishButton.innerText = "Add to Document";
    document.querySelector("#exportpanel").appendChild(finishButton);
    finishButton.addEventListener("click", function() {
        mainProcess(globals, async function() {
            await Photopea.runScript(window.parent, `app.open("${document.querySelectorAll("canvas")[1].toDataURL()}", null, true);`);
            await Photopea.runScript(window.parent, `app.activeDocument.activeLayer.blendMode = "screen";`);
        }, true);
    });
}