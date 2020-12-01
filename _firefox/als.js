/*
    START SETTINGS
*/

var SHOW_BOUNDING_BOXES = true;
var CONTROLS_DIV_BACKGROUND_COLOR = 'yellow';

/*
    END SETTINGS
*/


/*
    START MAIN
*/

var boundingBoxesList = [];

if (document.URL.includes('action,viewer'))
{

    if (document.URL.includes('anews,true/'))
    {
        // That "anews,true/" in the URL changes the page in someway, I don't really care how. I can just remove it and refresh the page.
        var newUrl = document.URL.replace('anews,true/','');
        window.history.pushState("???", "???", newUrl);
    }

    // We are currently in a page that should show the Flash Player viewer!

    // article_id => current page we are looking at. 
    // s_field => it's like a session id, we need it for API calls.

    var article_id = document.getElementById('p_articleid').value;
    var s_field = document.getElementsByName('t')[0].value;
    var url = "http://www.archiviolastampa.it/load.php?url=/downloadContent.do?id=" + article_id +"&s=" + s_field;

    console.debug("Viewer detected (article id: " + article_id + ") with s_field: " + s_field);

    // Replace the Flash Player viewer with our viewer.
    newElement(url, article_id);
    // Listen for clicks on stuff. Need this to run JavaScript code stored in the extension when we click a button in the webpage.
    window.addEventListener("click", notifyExtension);

}


/*
    END MAIN
*/

function newElement(url, article_id) 
{ 

    // Append current article id in the page for later use.
    
    var currentArticleDOM = document.createElement('input');
    currentArticleDOM.type = 'hidden';
    currentArticleDOM.id = 'current_article';
    currentArticleDOM.value = article_id;
    document.body.appendChild(currentArticleDOM);

    // Append current s_field in the page for later use.

    var sFieldDom = document.createElement('input');
    sFieldDom.type = 'hidden';
    sFieldDom.id = 's_field';
    sFieldDom.value = s_field;
    document.body.appendChild(sFieldDom);

    // Create a new div to host the newspaper page.

    var newDiv = document.createElement('div');
    newDiv.id = 'customDiv';
    newDiv.style.textAlign = 'center';
         
    // Create and append the newspaper page to the new div and remove the old Flash Player viewer object
    
    var newImage = document.createElement('img');
    newImage.src = url;
    newImage.id = 'newsPage';
    newImage.style.visibility = 'hidden';
    
    // Create a canvas to host binding boxes and the newspaper page
    
    var boxCanvas = document.createElement('canvas');
    boxCanvas.id = 'boxCanvas';
    boxCanvas.width = newImage.width;
    boxCanvas.height = newImage.height;
    boxCanvas.style.background = "url('" + url + "')";

    newDiv.appendChild(boxCanvas);

    console.debug("Created new DOM");
    
    var currentDOM = document.getElementById('main_content'); 
    currentDOM.appendChild(newDiv);

    // Preparing to remove old Flash Player stuff from the page

    var viewer = document.getElementById('viewer');
    if (viewer !== null)
    {
        // Try to remove the old viewer only if it exists (you have Flash Player enabled)
        viewer.remove();
        console.debug("Removed old flash player DOM");
    }

    var contenutoDivAttuale = document.getElementById('main_content').innerHTML;
    if (contenutoDivAttuale.includes('Supporto Flash non rilevato.'))
    {
            document.getElementById('main_content').innerHTML = contenutoDivAttuale.replace('</script>Supporto Flash non rilevato. Questa applicazione richiede il plugin Adobe Flash Player. <a href="http://www.adobe.com/go/getflash/">Get Flash</a>','</script>');;
    }
    
    console.debug("Removed 'Missing Flash Player' warning");
    
    // Preparing "controls" div    
    // Prepare the URL for previous and next page to "draw" the controls
    
    previousPageID = previousPageURL(article_id);
    nextPageID = nextPageURL(article_id);
    firstPageID = firstPageURL(article_id);
    
    // Create a new div to host the controls (previous page, next page, download pdf, download ocr) and add them to the page just on top of the newspaper's page
    
    var controlsDiv = document.createElement('div');
    controlsDiv.id = 'controls';
    controlsDiv.style.textAlign = 'center';
    controlsDiv.style.marginBottom = '10px';
    // TODO: Add "go to first page".
    // TODO: Add "go to last page".
    // TODO: Add "go to custom page".
    controlsDiv.innerHTML = "<a id = 'firstButton' href = 'javascript:void(0);' data-newarticleid = '" + firstPageID + "' data-sfield = '" + s_field + "'>FIRST PAGE</a> - <a id = 'backButton' href = 'javascript:void(0);' data-newarticleid = '" + previousPageID + "' data-sfield = '" + s_field + "'>PREVIOUS PAGE</a> - <a id = 'forwardButton' href = 'javascript:void(0);' data-newarticleid = '" + nextPageID + "' data-sfield = '" + s_field + "'>NEXT PAGE</a> - <a id = 'downloadPdfButton' href = 'javascript:void(0);' data-sfield = '" + s_field + "'>PDF</a> - <a id = 'downloadOcrButton' href = 'javascript:void(0);' data-sfield = '" + s_field + "'>OCR</a>";
    // HACK: Don't worry, this is temporary. Just to see if the extension is working and where the controls are.
    controlsDiv.style.background = CONTROLS_DIV_BACKGROUND_COLOR;
    
    var mainContainer = document.getElementById('maincontainer');
    var currentDOM = document.getElementById('main_content_wrapper'); 
    mainContainer.insertBefore(controlsDiv, currentDOM);
    
    // Footer and Facebook/Twitter buttons are in the way, I'll just remove them for now and figure it out later.
    
    document.getElementById('footer').remove();
    document.getElementById('i_like_lastampa').remove();

    if (SHOW_BOUNDING_BOXES)
    {
        findBindingBoxes(article_id, s_field);
    }
    else
    {
        console.debug("Binding boxes are disabled (SHOW_BOUNDING_BOXES is set to false)");
    }
        
}
    
function updateControls()
{
        
    // Updates the controls after changing page.
    
    currentArticleID = document.getElementById('current_article').value;
    
    previousPageID = previousPageURL(currentArticleID);
    nextPageID = nextPageURL(currentArticleID);
    firstPageID = firstPageURL(currentArticleID);
    
    var backButton = document.getElementById('backButton');
    var forwardButton = document.getElementById('forwardButton');
    var firstButton = document.getElementById('firstButton');
    backButton.dataset.newarticleid = previousPageID;
    forwardButton.dataset.newarticleid = nextPageID;
    firstButton.dataset.newarticleid = firstPageID;

    console.debug("Updated controls");
}

function clearCanvas(canvas)
{
    // Empty the canvas.
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function changeImage(newArticleID, s_field)
{

    // Changes the newspaper page on the screen and updates controls

    console.debug(newArticleID);
    console.debug(s_field);

    // Put the image in a img field but hide it, we want the image in a canvas and not in the middle of the page like before.

    var url = "http://www.archiviolastampa.it/load.php?url=/downloadContent.do?id=" + newArticleID +"&s=" + s_field;
    var pageImage = document.createElement('img');
    pageImage.src = url;
    pageImage.id = 'newsPage';
    pageImage.style.visibility = 'hidden';

    pageImage.addEventListener('load', (event) => 
    {
        // Add the new image to the canvas
        var boxCanvas = document.getElementById('boxCanvas');
        var ctx = boxCanvas.getContext("2d");
        ctx.drawImage(pageImage, 0, 0);
        findBindingBoxes(newArticleID, s_field);
        console.debug("Updated image and bounding boxes");
    });
    
    pageImage.src = url;

    // Update current article id so we don't get stuck on the same page over and over again

    var current_article_dom = document.getElementById('current_article');
    current_article_dom.value = newArticleID;

    // Update controls so we don't get stuck on the same page over and over again
    // Remove cached bounding boxes to prepare for the new page.

    updateControls();
    boundingBoxesList = [];

    console.debug("Changed page");

}

function nextPageURL(article_id)
{
    
    // Generates the next page url by just adding 1 to the "page" field.
    // "Page" field it's always the 5th element of the array splitting by underscore the "article_id"

    fields = article_id.split("_");
    fields[4] = ("0000" + (parseInt(fields[4]) + 1)).slice(-4);
    newArticleID = fields.join('_');

    return newArticleID;

}

function previousPageURL(article_id)
{
    
    // Generates the next page url by just subtracting 1 to the "page" field.
    // "Page" field it's always the 5th element of the array splitting by underscore the "article_id"

    fields = article_id.split("_");

    if (parseInt(fields[4]) == 1)
    {
        return "FIRST_PAGE";
    }

    fields[4] = ("0000" + (parseInt(fields[4]) - 1)).slice(-4);
    newArticleID = fields.join('_');

    return newArticleID;

}

function firstPageURL(article_id)
{
    
    // Generates the next page url by just subtracting 1 to the "page" field.
    // "Page" field it's always the 5th element of the array splitting by underscore the "article_id"

    fields = article_id.split("_");

    if (parseInt(fields[4]) == 1)
    {
        return "FIRST_PAGE";
    }

    fields[4] = '0001';
    newArticleID = fields.join('_');

    return newArticleID;

}

function notifyExtension(e) 
{

    // Handles clicks on links.
    // This function intercepts every click, surely there is a better way.

    if (e.target.tagName != "A" || e.target.dataset.sfield === undefined) 
    {
        // It's not a link or it's not a custom field from this extension.
        // Yes, we don't need to pass "sfield" every time but for now I'll duplicate it just to tell my "a" tags apart.
        return;
    }

    sfield = e.target.dataset.sfield;

    if (e.target.id === 'downloadPdfButton')
    {
        // Click on "PDF" from "controls" div.
        // Opens the PDF download API to a new page that should close after the download starts.
        var currentArticleID = document.getElementById('current_article').value;
        var url = "http://www.archiviolastampa.it/getPdf.php?format=A4&id=" + currentArticleID + "&s=" + sfield;
        window.open(url, '__blank');
    }
    else if (e.target.id === 'downloadOcrButton')
    {
        // Click on "OCR" from "controls" div.
        // Opens the OCR download API to a new page that should close after the download starts.
        var currentArticleID = document.getElementById('current_article').value;
        var url = "http://www.archiviolastampa.it/load.php?url=/downloadPage.do?id=" + currentArticleID + "&s=" + sfield;
        window.open(url, '__blank');
    }
    else
    {
        // None of the above? We're just trying to change page.
        // Where should i go?
        newArticleID = e.target.dataset.newarticleid;

        if (newArticleID === 'FIRST_PAGE')
        {
            // There is no previous page!
            alert("This is the first page!");
            return;
        }
    
        changeImage(newArticleID, sfield);
    
        log.debug("Changed page");
    }

    return;

}

function findBindingBoxes(current_article, s_field)
{
    // Calls the "bounding box" API to obtain the bounding boxes position
    var articleIdNoMetadataId = stripMetadataId(current_article);
    var url = "http://www.archiviolastampa.it/load.php?url=/search/select/?wt=json&q=pageID:" + articleIdNoMetadataId + "&s=" + s_field;
    // Actual call! The function metadataCallback() will be called after this.
    getJSON(url, metadataCallback);
}

function stripMetadataId(full_article_id)
{
    // Removes (if present) the last part of the article id.
    // The last part represents the metadata id, we need it empty to get the metadata list.
    var idSplit = full_article_id.split("_");
    if (idSplit.length > 5)
    {
        idSplit = idSplit.slice(0,5);
    }

    return idSplit.join("_");
}

function metadataCallback(status, response)
{
    // This function will be called after the call to the "Metadata" API
    if (status != 200)
    {
        // Something went wrong.
        // If error 501 maybe s_field is wrong or empty.
        alert("Error getting metadata!");
        console.error("Error getting metadata (" + status + ")");
    }
    else
    {
        var docs = response.response.docs;
        for (var i = 0; i < docs.length; i++)
        {
            // For every metadata that you found
            var currentDoc = docs[i];
            var currentArticleId = document.getElementById('current_article').value;
            var currentArticleIdNoMetadataId = stripMetadataId(currentArticleId);

            if (currentDoc.pageID == currentArticleIdNoMetadataId)
            {
                // If this metadata is for the page that I'm currently showing
                var metadataId = currentDoc.id;
                // Append the metadata id to the article id
                var currentArticleIdForBindingBoxes = currentArticleIdNoMetadataId + "_" + metadataId;
                // The hidden input field "s_field" is a bit redundant, we could use the native field "t" but for now it's ok.
                var s_field = document.getElementById('s_field').value;
                var url = "http://www.archiviolastampa.it/load.php?url=/item/getmetadata.do?articleid=" + currentArticleIdForBindingBoxes +"&query=&s=" + s_field;
                // Call the "Bounding Boxes" API and call the function boundingBoxCallback() after that
                getJSON(url, boundingBoxCallback)
            }
        }
    }
}


function boundingBoxCallback(status, response)
{
    if (status != 200)
    {
        // Something went wrong.
        // If error 501 maybe s_field is wrong or empty.
        alert("Error getting binding box data!");
        console.error("Error getting binding box data (" + status + ")");
    }
    else
    {
        // Get the rectangles for this page.
        var areaList = response.arealist;
        // Get the current canvas
        var canvas = document.getElementById('boxCanvas');
        var ctx = canvas.getContext("2d");
        for (var i = 0; i < areaList.length; i++)
        {
            // For every rectangle get the coordinates and draw them onto the image (newspaper page) outlined in red
            var currentArea = areaList[i];
            var rectData = [parseInt(currentArea.hpos), parseInt(currentArea.vpos), parseInt(currentArea.width), parseInt(currentArea.height)]
            ctx.beginPath();
            ctx.strokeStyle = "#FF0000";
            ctx.strokeRect(currentArea.hpos, currentArea.vpos, currentArea.width, currentArea.height);
            ctx.stroke();
        }
        for (var i = 0; i < areaList.length; i++)
        {
            // Create a global array with all bounding boxes coordinates.
            boundingBoxesList.push(areaList[i]);
        }
        // Add the onload event to the canvas to detect hovering on binding boxes
        detectHoverOnRectangle(boundingBoxesList);
    }
}

function getJSON(url, callback)
{
    // https://stackoverflow.com/questions/12460378/how-to-get-json-from-url-in-javascript/12460434
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() 
    {
        var status = xhr.status;
        callback(status, xhr.response);
    };
    xhr.send();
}

// TODO: Detect hover on rectangles and show OCR


function detectHoverOnRectangle(rectangles)
{

    // Attach an onLoad event to detect when I'm hovering on a bounding box and show the OCR text.
    
    var canvas = document.getElementById('boxCanvas');
    context = canvas.getContext("2d");

    //canvas.onmousemove = function(e) 
    canvas.onclick = function(e) 
    {
        for (var i = 0; i < rectangles.length; i++)
        {
            // For every bounding box on the page
            var rect = canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;

            var currentRect = rectangles[i];

            if (isPointInRectangle(x, y, {'x': currentRect.hpos, 'y': currentRect.vpos, 'width': currentRect.width, 'height': currentRect.height}))
            {
                context.beginPath();
                context.strokeStyle = "#00FF00";
                context.strokeRect(currentRect.hpos, currentRect.vpos, currentRect.width, currentRect.height);
                context.stroke();
            }
        }
    };
}

function isPointInRectangle(x,y,rect)
{
    return (x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height);
}