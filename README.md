# Sportparken #

Website for adding contact information of associations which are renting sports fields within the City of Amsterdam.
The site uses the internally available Handelsregister API, TMS mapping service and WMS aerial photography plus the BGT and BAG Pand & Openbare Ruimte topological data.

### Install procedure ###
download and install <a href="https://www.docker.com">docker</a></br>

git clone https://github.com/DatapuntAmsterdam/Sportparken.git sportparken or download the zip file
cd sportparken
docker-compose build
docker-compose up

The site can be found on localhost:8113</br>
The postgres database can be found on localhost:5401
It will initatially install with the current assosiations and BGT fields
