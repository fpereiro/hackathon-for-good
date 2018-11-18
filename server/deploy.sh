HOST="USER@IP"

FOLDER="hackathon-for-good"
TAR="model.tar.gz"

cd ../.. && tar --exclude="$FOLDER/*.swp" -czvf $TAR $FOLDER
scp $TAR $HOST:
ssh $HOST tar xzvf $TAR
echo "main = node server $1" | ssh $HOST "cat >> $FOLDER/mongroup.conf"
ssh $HOST "cd $FOLDER && npm i --no-save && mg restart"
ssh $HOST rm $TAR
rm $TAR
