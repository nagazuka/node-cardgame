sed -n '1h;1!H;${g;s/<!-- START.*END APP-JS -->/<script type="text\/javascript" src="dist\/all.js"><\/script> /;p;}' test.html
