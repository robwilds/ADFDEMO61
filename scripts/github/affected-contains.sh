#!/usr/bin/env bash
set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
verifyLib=$1;
cd $DIR/../../

if [ "${GITHUB_EVENT_NAME}" == "schedule" ]; then
  #echo "Affected not check in case of cron"
  echo true
  exit 0
fi
AFFECTED_LIBS=$(npx nx print-affected --type=lib --select=projects ${NX_CALCULATION_FLAGS} --plain)
#echo "Verify if affected build contains $1"
#echo "Affected libs:$AFFECTED_LIBS"
if [[  $AFFECTED_LIBS =~ $verifyLib ]]; then
    #echo "Yep project:$verifyLib is affected carry on"
    echo true
else
    #echo "Nope project NOT affected save time"
    echo false
fi;