DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
nohup nodemon $DIR/server.js </dev/null &
