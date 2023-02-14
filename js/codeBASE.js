var gipid = 1;
let tnameTemplate = "TEILNEHMERNAME";
let tname = '<span contenteditable role="textbox" id="TN">'+tnameTemplate+'</span>';

let date = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
let tdate = '<span contenteditable role="textbox">'+date.toLocaleDateString('de-DE', options)+"</span>";

//tasks
let defaultTasks = [];

window.addEventListener("DOMContentLoaded", () => {
    loadAdder();
    document.querySelector("#title").innerHTML = `Ausbildung und Arbeit plus @ MOIN - Motiviert = Intigriert - ${tname} @ ${tdate}`;
    
    document.querySelector("#importBtn").onclick = () => {importProtocol()};
    document.querySelector("#exportBtn").onclick = () => {exportProtocol()};
    document.querySelector("#clearBtn").onclick = () => {removeAllEntries()};
    document.querySelector("#exportPdfBtn").onclick = () => {exportPDF()};
    document.querySelector("#cov19PBtn").onclick = () => {specialEntry(getNow(),"Covid Test gemacht","Ergebnis Positiv","first","red")};
    document.querySelector("#cov19NBtn").onclick = () => {specialEntry(getNow(),"Covid Test gemacht","Ergebnis Negativ","first","green")};
    document.querySelector("#TN").oninput = (event) => {if(event.currentTarget.innerText != tnameTemplate) document.querySelector("#exportPdfBtn").setAttribute};
    
    //DefaultTasks - StandartAufgaben
    document.querySelector("#addDefaultBtn").innerText = "Standart Tätigkeit hinzufügen (+)";
    document.querySelector("#addDefaultBtn").onclick = () => {
        let time = document.querySelector("#defTaskTime").innerText;
        let task = document.querySelector("#defTaskTask").innerText;
        let note = document.querySelector("#defTaskNote").innerText;

        if(time.length <= 0|| task.length <= 0) {
            return;
        }

        if(!time.includes(":")) {
            return;
        }

        time = time.substr(time.indexOf(":")-2,time.indexOf(":")+3);
        newEntry(time,task,note,"defaultTasks");
    }
    //document.querySelector("#backgroundBtn").onclick = () => {document.body.style.backgroundImage = 'url("")'};
    updatePageFeatures();


    for(let setting of document.querySelectorAll(".setting"))
        setting.oninput = (event) => {
            saveSetting(event.currentTarget)
        };

    document.querySelector("#bgColorController").oninput = (event) => {changeBackgroundColor(false,event.currentTarget.value)};
    document.querySelector("#TN").addEventListener("input",() => {localStorage.setItem('TN', document.querySelector("#TN").innerText)});
    if(localStorage.TN != null)
        document.querySelector("#TN").innerHTML = localStorage.TN;

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});



let loadAdder = () => {
    document.querySelector("#addWrapper").innerText = "Tätigkeit hinzufügen (+)";
    document.querySelector("#addWrapper").onclick = () => {
        newEntry();
    }
}


let newEntry = (time,text,note,place,sorting) => {
    let tr = document.createElement("tr");
    
    for(let i = 0;i < 3;i++) {

        let td = document.createElement("td");
        let input = document.createElement("span");       
        let editable = document.createAttribute("contenteditable"); 
        if(place == null || place == "main")
            input.setAttributeNode(editable);
        input.setAttribute("role","textbox");
        input.classList.add("form-control");

        let today = new Date();

        if(i == 0)
            if((today.getHours() >= 15))
                input.innerText = `${today.getHours()}:${today.getMinutes()}`;
            else if((today.getHours() >= 10) && (today.getHours() <= 14))
                input.innerText = "11:00";
            else
                input.innerText = "9:00";

        if(i == 1 && gipid == 1)
            input.innerText = "Aufbauen von Arbeitsmaterialien";

        if(i == 0 && time != null) {
            input.innerText = time;
        }
        if(i == 1 && text != null) {
            input.innerText = text;
        }
        if(i == 2 && note != null) {
            input.innerText = note;
        }

        

        input.setAttribute("scope","row");
        td.appendChild(input);
        tr.appendChild(td);
    }

    tr.id = "GIP-"+gipid;
    tr.classList.add("GIP");
    if(place == null || place == "main")
        if(sorting != null && sorting == "first") {
            document.querySelector("#tableGroup").insertBefore(tr,document.querySelector("#tableGroup").firstChild);
        } else if(sorting != null) {
            document.querySelector("#tableGroup").insertBefore(tr,sorting);
        } else {
            document.querySelector("#tableGroup").appendChild(tr);
        }
    else {
        try {
            if(sorting != null && sorting == "first") {
                document.querySelector(`#${place}`).insertBefore(tr,document.querySelector(`#${place}`).firstChild);
            } else if(sorting != null) {
                document.querySelector(`#${place}`).insertBefore(tr,sorting);
            } else {
                document.querySelector(`#${place}`).appendChild(tr);
            }
        } catch(err) {
            console.log("Could not create Element, parent doesnt exist",err);
            return;
        }
        addDefaultTasks(gipid);
    }

    let div = document.createElement("div");
    div.classList.add("d-grid","gap-2");
    let btn = document.createElement("button");
    let i = document.createElement("i");
        i.classList.add("bi","bi-trash");
    btn.appendChild(i);
    btn.classList.add("btn","btn-danger","exportHidden");
    btn.setAttribute("removeID","GIP-"+gipid);
    btn.onclick = () => {
        removeEntry(btn.getAttribute("removeID"));
        removeDefaultTasks(gipid);
    }
    


    div.appendChild(btn);
    tr.appendChild(div);
    
    gipid++;
    return tr;
}


let removeEntry = (id) => {
    document.querySelector("#"+id).remove();
}

let removeAllEntries = () => {
    if(document.querySelectorAll(".GIP").length >= 1) {
        for(let el of document.querySelectorAll('.GIP')) {
            removeEntry(el.id);
        }
    };
}

const exportProtocol = () => {
    if(document.querySelectorAll(".GIP").length < 1) {return};
    saveToFile();
}

const importProtocol = () => {

    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => { 
    var file = e.target.files[0];
    input.remove(); 
    //console.log(file);

    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(file);

    }

    input.click();
}

function onReaderLoad(event){
    removeAllEntries();
    var obj = JSON.parse(event.target.result);

    for(let arr of obj) {
        newEntry(...arr);
    }
}

function convertToJSON(...gipid) {
    let textRows = [];
    let text = [];

    for(let gip of document.querySelectorAll(".GIP")) {
        for(let el of gip.children) {
            if(el.tagName == "TD") {
               text.push(el.firstChild.innerText);
             }             
        }
        textRows.push(text);
        text = [];
    }

    document.getElementById('download').value = JSON.stringify(textRows)
  }
  
  function saveToFile() {
    convertToJSON();
    var jsonObjectAsString = document.getElementById('download').value;
  
    var blob = new Blob([jsonObjectAsString], {
      //type: 'application/json'
      type: 'octet/stream'
    });
    console.log(blob);
  
    var anchor = document.createElement('a')
    anchor.download = "export.json";
    anchor.href = window.URL.createObjectURL(blob);
    anchor.innerHTML = "download"
    anchor.click();
  
    console.log(anchor);
  
    document.getElementById('download').append(anchor)
  
  
  }


  function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

const hideElements = () => {
    for(let element of document.querySelectorAll(".exportHidden")) {
        element.style.display = "none";
    }
}

const showElements = () => {
    for(let element of document.querySelectorAll(".exportHidden")) {
        element.style.display = null;
    }
}

const exportPDF = () => {
    hideElements();
    var pdf_content = document.getElementById("element-to-print");
    var options = {
        margin:       1,
        filename:     `Tagesbericht ${new Date().getDate()}.${new Date().getUTCMonth()+1}.${new Date().getFullYear()} .pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
    html2pdf(pdf_content,options);
    showElements();
}

const specialEntry = (time,text,note,place,sorting,color) => {
    let entry = newEntry(time,text,note,place,sorting);
    entry.style.backgroundColor = color;
}

const getNow = () => {
    const date = new Date();
    return `${date.getHours()}:${date.getMinutes()}`;
}

const changeBackgroundColor = (isImage,hex) => {
    if(!isImage || isImage == null)
        document.body.style.backgroundColor = hex;
}

const updateSettingButtons = () => {
    for(let setting of document.querySelectorAll(".setting")) {
        if(localStorage.getItem(setting.id)) {
            let attr = document.createAttribute("checked");
            setting.setAttributeNode(attr);
        } else {
            let attr = document.createAttribute("checked");
            setting.removeAttribute(attr);
        }
    }
}

const saveSetting = (element) => {
    localStorage.setItem(element.id,element.checked);
    console.log(`Updated Setting: ${element.id} to ${element.checked}`)

    updatePageFeatures();
}

const updatePageFeatures = () => {
    updateSettingButtons();

    if(localStorage.getItem("betaFeature") === 'true') {
        for(let betaFeature of document.querySelectorAll(".betaFeature")) {
            betaFeature.style.display = null;
        }
    } else {
        for(let betaFeature of document.querySelectorAll(".betaFeature")) {
            betaFeature.style.display = "none";
        } 
    }
}

const updateDefaultTasks = () => {
    console.log(defaultTasks);
}

const loadDefaultTasks = () => {
    console.log("loaded gipids from localstorage");
    defaultTasks = localStorage.getItem("defaultTasks");
}

const addDefaultTasks = (gipid) => {
    console.log("gipid added");
    defaultTasks.push(gipid);
    localStorage.setItem("defaultTasks",defaultTasks);
}

const removeDefaultTasks = (gipid) => {
    console.log("gipid removed");
    defaultTasks.pop(gipid);
    localStorage.setItem("defaultTasks",defaultTasks);
}