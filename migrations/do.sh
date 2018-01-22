#!/bin/sh
mongo localhost ./remove.js

mongoimport -d edumiga -c Institution --headerline --type=csv ./institutions.csv
mongoimport -d edumiga -c Opportunity --headerline --type=csv ./opportunities.csv

mongo localhost ./migrations.js

