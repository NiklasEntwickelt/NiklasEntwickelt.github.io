var source = window.document.getElementsByTagName("body")[0];
var specialElementHandlers = {
    '#hidden-element': function (element, renderer) {
        return true;
    }
};
var doc = new jsPDF({
    orientation: 'landscape'
});
doc.setFont("courier");
doc.setFontType("normal");
doc.setFontSize(24);
doc.setTextColor(100);
doc.fromHTML(source.html, 15, 15, {
    'width': 170,
    'elementHandlers': specialElementHandlers
});