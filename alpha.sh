#!/bin/sh

./compressjs.sh behaviour/text.js behaviour/constants.js behaviour/tasks.js behaviour/animation.js behaviour/view.js behaviour/engine.js behaviour/messagehandler.js behaviour/application.js
sudo rsync -rv --delete --exclude=.git --exclude=server/node_modules* --exclude=*.pyc --exclude=nohup.out --exclude=*.log /home/tornado/development/node-websocket/ /var/www/vhosts/nagazuka.nl/subdomains/troefcall/websocket-cardgame/alpha
sudo sed -n '1h;1!H;${g;s/<!-- START.*END APP-JS -->/<script type="text\/javascript" src="dist\/all.js"><\/script> /;p;}' index.html > /var/www/vhosts/nagazuka.nl/subdomains/troefcall/websocket-cardgame/alpha/index_tmp.html
sudo cp /var/www/vhosts/nagazuka.nl/subdomains/troefcall/websocket-cardgame/alpha/index_tmp.html /var/www/vhosts/nagazuka.nl/subdomains/troefcall/websocket-cardgame/alpha/index.html

#sudo sed 's/TroefCall Online/TroefCall Online Alpha/g' /var/www/vhosts/nagazuka.nl/subdomains/troefcall/websocket-cardgame/alpha/index.html >index_alpha.html
#sudo mv index_alpha.html /var/www/vhosts/nagazuka.nl/subdomains/troefcall/alpha/index.html 
