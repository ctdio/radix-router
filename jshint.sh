echo "Running jshint..."

./node_modules/.bin/jshint --exclude-path .jshintignore index.js

if [ $? -ne 0 ]; then
    echo "Found jshint errors"
    exit 1
fi
echo "No jshint errors"
