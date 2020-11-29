/*
    START MAIN
*/

if (document.URL.includes('action,viewer'))
{
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
    
    var current_article_dom = document.createElement('input');
    current_article_dom.type = 'hidden';
    current_article_dom.id = 'current_article';
    current_article_dom.value = article_id;
    document.body.appendChild(current_article_dom);

    // Create a new div to host the newspaper page.

    var newDiv = document.createElement('div');
    newDiv.id = 'customDiv';
    newDiv.style.textAlign = 'center';

    // Create and append the newspaper page to the new div and remove the old Flash Player viewer object
    
    var newImage = document.createElement('img');
    newImage.src = url;
    newImage.id = 'newsPage';
    newDiv.appendChild(newImage);
    
    console.debug("Created new DOM");
    
    var currentDOM = document.getElementById('main_content'); 
    currentDOM.appendChild(newDiv);
    var viewer = document.getElementById('viewer');
    viewer.remove();
    
    console.debug("Removed old flash player DOM");

    // Prepare the URL for previous and next page to "draw" the controls
    
    previousPageID = previousPageURL(article_id);
    nextPageID = nextPageURL(article_id);

    // Create a new div to host the controls (previous page, next page, download pdf, download ocr) and add them to the page just on top of the newspaper's page

    var controlsDiv = document.createElement('div');
    controlsDiv.id = 'controls';
    controlsDiv.style.textAlign = 'center';
    // TODO: Add "go to first page".
    // TODO: Add "go to last page".
    // TODO: Add "go to custom page".
    controlsDiv.innerHTML = "<a id = 'backButton' href = 'javascript:void(0);' data-newarticleid = '" + previousPageID + "' data-sfield = '" + s_field + "'>PREVIOUS PAGE</a> - <a id = 'forwardButton' href = 'javascript:void(0);' data-newarticleid = '" + nextPageID + "' data-sfield = '" + s_field + "'>NEXT PAGE</a> - <a id = 'downloadPdfButton' href = 'javascript:void(0);' data-sfield = '" + s_field + "'>PDF</a> - <a id = 'downloadOcrButton' href = 'javascript:void(0);' data-sfield = '" + s_field + "'>OCR</a><br/><br/><br/><br/><br/>";
    // HACK: Don't worry, this is temporary. Just to see if the extension is working and where the controls are.
    controlsDiv.style.background = 'yellow';

    var mainContainer = document.getElementById('maincontainer');
    var currentDOM = document.getElementById('main_content_wrapper'); 
    mainContainer.insertBefore(controlsDiv, currentDOM);

    // HACK: Footer and Facebook/Twitter buttons are in the way, I'll remove them for now.

    document.getElementById('footer').remove();
    document.getElementById('i_like_lastampa').remove();

}

function updateControls()
{

    // Updates the controls after changing page.

    currentArticleID = document.getElementById('current_article').value;
 
    previousPageID = previousPageURL(currentArticleID);
    nextPageID = nextPageURL(currentArticleID);

    var backButton = document.getElementById('backButton');
    var forwardButton = document.getElementById('forwardButton');
    backButton.dataset.newarticleid = previousPageID;
    forwardButton.dataset.newarticleid = nextPageID;

    console.debug("Updated controls");
}

function changeImage(newArticleID, s_field)
{

    // Changes the newspaper page on the screen and updates controls

    console.debug(newArticleID);
    console.debug(s_field);

    var pageImage = document.getElementById('newsPage');
    var url = "http://www.archiviolastampa.it/load.php?url=/downloadContent.do?id=" + newArticleID +"&s=" + s_field;
    pageImage.src = url;

    var current_article_dom = document.getElementById('current_article');
    current_article_dom.value = newArticleID;

    updateControls();

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