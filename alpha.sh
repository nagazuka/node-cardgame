#!/bin/sh

SRC_DIR=`pwd`
#TARGET_DIR=/var/www/vhosts/nagazuka.nl/subdomains/troefcall/websocket-cardgame/alpha
TARGET_DIR=/var/www/html/troefcall-alpha

echo $SRC_DIR 
echo $TARGET_DIR

sudo mkdir -p $TARGET_DIR
mkdir dist

./compressjs.sh behaviour/text.js behaviour/constants.js behaviour/tasks.js behaviour/animation.js behaviour/view.js behaviour/engine.js behaviour/messagehandler.js behaviour/application.js
sudo rsync -rv --delete --exclude=.git --exclude=*.sh --exclude=server/node_modules* --exclude=*.pyc --exclude=nohup.out --exclude=*.log $SRC_DIR/ $TARGET_DIR
sudo sed -n '1h;1!H;${g;s/<!-- START.*END APP-JS -->/<script type="text\/javascript" src="dist\/all.js"><\/script> /;p;}' index.html > $TARGET_DIR/index_tmp.html
sudo cp $TARGET_DIR/index_tmp.html $TARGET_DIR/index.html
