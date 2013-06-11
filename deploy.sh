DOCROOT=/var/www/html/troefcall/
# DEV deploy
sudo rsync -rv --exclude=*.png --exclude=server/ --exclude=TODO --exclude=README --exclude=*.sh  --exclude=tools/ ./* $DOCROOT
# FULL deploy
#sudo rsync -rv --exclude=server/ --exclude=TODO --exclude=README --exclude=*.sh  --exclude=tools/ ./* $DOCROOT
