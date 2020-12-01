# Alternative player for "Archivio La Stampa" (www.archiviolastampa.it)

## What:

Browser extension that offers an alternative player for www.archiviolastampa.it.

Archivio "La Stampa" is a website that contains all editions of the newspaper "La Stampa" from 1867 to the end of 2005

## Why:

The site hosting the content uses Flash Player to interact with the archive.
Flash Player is going to be EOL (End of Life) after December 31 2020 (https://www.adobe.com/it/products/flashplayer/end-of-life.html) and the site may be impossible to use for nobody knows how long.


Read more (Italian only):

- https://www.ilpost.it/2020/11/27/archivio-storico-la-stampa-flash-player/
- https://innovando.it/138-anni-sul-filo-del-rasoio-archivio-storico-della-stampa-paga-lo-scotto-di-flash-player/
- https://tedeschini.medium.com/tecnologia-digitale-obsoleta-un-secolo-e-mezzo-di-storia-a-rischio-1bb75bf68c2f

## Settings:

At the start of 'als.js' I added some simple settings, mostly useless for now

## Development status:

Everything seems to work fine. You can:

- Watch articles.
- Change pages.
- Download the page in PDF.
- Download OCR data in TXT.
- Show boxes around text recognized by OCR (left click to higlight it in green). Yes, this is useless for now.

PDF and OCR is not done by the extension, it's integrated in the website and its APIs.

If page does not load correctly please refresh and wait. Sometimes the newspaper article won't load and sometimes only the boxes will appear, I'm trying to figure out why.

## How to load:

1. Clone this repository.
2. Go to: "about:debugging#/runtime/this-firefox".
3. Click on "This Firefox" (on the left bar).
4. Click on "Load Temporary Add-on" (top right side).
5. Navigate to the cloned repository on your computer and double click 'als.js'.

After this the extension is ready (until you close Firefox) and you can use the site without having Flash Player, you just need to visit an article page (ex: http://www.archiviolastampa.it/component/option,com_lastampa/task,search/mod,libera/action,viewer/Itemid,3/page,10/articleid,1040_01_1982_0130_0001_14971132/).


## DISCLAIMER:

This is my first try at a browser extension and I don't think I will make every functionality available, all I'm looking forward to is a way to browse pages and read.
I don't really care about the "binding boxes" around text or the OCR (in some pages it's pretty bad anyway), it's just a project to practice.

## Wanna help?

This is GitHub, feel free to make a pull request.

## More?

What? You think that with the death of Flash Player they'll take down the entire site making the entire content unavailable?
Check out https://github.com/PaaaulZ/DumpArchivioLaStampa (be sure to read the disclaimer section).