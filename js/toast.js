console.log("Toast API loaded!")


const sendToast = (toastID) => {
    let toastElement = document.querySelector(`#${toastID}`)

    const toast = new bootstrap.Toast(toastElement)
    toast.show()
}

const ToastAPIcreateElement = (elementTag,...classes) => {
    let element = document.createElement(elementTag);
    if(classes.length > 0)
        element.classList.add(...classes);
    return element;
} 

const createToast = (toastID,toastTitle,toastMessage, toastImageSrc) => {

    if(document.querySelector("#"+toastID) != null) {deleteRecursive(document.querySelector("#"+toastID))}

    if(toastTitle == undefined || toastTitle == null) toastTitle = "Unkown Title";
    if(toastMessage == undefined || toastMessage == null) toastMessage = "Unkown Error";

    let toastContainer = document.querySelector("#toastContainer");
    if(!toastContainer) {console.error("No Toast container found");return}


    let toastWrapper = ToastAPIcreateElement("div","toast");
        toastWrapper.setAttribute("role","alert");
        toastWrapper.setAttribute("aria-live","assertive");
        toastWrapper.setAttribute("aria-atomic","true");
        toastWrapper.id = toastID;


    let toastHeader = ToastAPIcreateElement("div","toast-header");
    if(toastImageSrc != null && toastImageSrc != undefined) {
        var toastImage = ToastAPIcreateElement("img","rounded","me-2");
            toastImage.height = "50";
            toastImage.src = toastImageSrc;
            toastHeader.appendChild(toastImage);
    }


    let toastHeaderText = ToastAPIcreateElement("strong","me-auto");
        toastHeaderText.innerText = toastTitle;
    let toastHeaderCloseButton = ToastAPIcreateElement("button","btn-close");
        toastHeaderCloseButton.setAttribute("type","button");
        toastHeaderCloseButton.setAttribute("data-bs-dismiss","toast");
        toastHeaderCloseButton.setAttribute("aria-label","Close");
    let toastBody = ToastAPIcreateElement("div","toast-body");
        toastBody.innerText = toastMessage;


        toastWrapper.appendChild(toastHeader);
        toastHeader.appendChild(toastHeaderText);
        toastHeader.appendChild(toastHeaderCloseButton);
        if(toastMessage != "")
            toastWrapper.appendChild(toastBody);
        toastContainer.appendChild(toastWrapper)

        sendToast(toastID);
}

const deleteRecursive = (element) => {
    element.firstChild.remove();
    if(element.children.length > 0) {
        deleteRecursive(element);
    } else
    element.remove();
}

