# README #

### What is this repository for? ###

* Provides a way to add library carousels based off record sets to a website. The example includes basic HTML and CSS that can be used to add the carousel to a website. Or the library can query the API endpoint directly and have JSON returned that can be parsed as desired.

## How do I get set up?

* For an example HTML file, see the index.html file from Example.zip in ['src/Carousels/Extras' folder](https://bitbucket.org/clcdpc/carousels/src)
 * If you're using the bitbucket website (instead of cloning the repository) Click "view raw" after clicking Example.zip to download a local copy of the zip file.
* To make a JSONP request (the name of the callback function is callback) use: https://carousels.clcohio.org/home/jsonp?callback=callback&rsid=RECORDSETID&ctx=PACPROFILENUMBER
* To receive a JSON list of title information use: https://carousels.clcohio.org/home/jsonp?callback=json&rsid=RECORDSETID&ctx=PACPROFILENUMBER 
* Replace RECORDSETID number with the number of the bib record set that contains the titles you want to display. Replace PACPROFILENUMBER with the PAC profile number (AKA CTX number) you want patrons to be directed to when they click on a title.
* To find your CTX number perform a search using YOUR PowerPAC profile, then locate the ctx= portion of the URL and the **FIRST number BEFORE the period** is your PAC profile number.
* Currently the service will return ALL titles listed in the bib record set.