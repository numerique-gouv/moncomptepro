#!/bin/bash
# This script is used to run e2e tests with cypress easily on your local machine

function echo_error() {
  echo -e "\e[91mError\e[39m: $1"
}

function echo_important() {
  echo ""
  echo -e "\e[92m$1\e[39m"
}

# check that this script in run from parent folder
if [ ! -d "cypress" ]; then
  echo_error "this script must be run from the root of the project."
  exit 1
fi

# create array of allowed test names by reading content of cypress/e2e
# folder and removing the file extension
available_tests=()
for file in cypress/e2e/*.js; do
  available_tests+=("$(basename "$file" .cy.js)")
done

action=""

case "${1}" in
  -h|--help|'')
    echo "Easily run e2e tests locally on your machine"
    echo "Usage:"
    echo "${0##*/} run [--force] [--port=PORT] [--host=HOST] TEST_NAME [-- CYPRESS_ARGS]"
    echo "  Run the given test in cypress."
    echo "  Before that, it clears local db, sets up env/fixtures and starts the server."
    echo "  Options:"
    echo "    --force: if passed, the script does not ask for confirmation"
    echo "             before clearing local database."
    echo "    --port:  choose port of the node server. This will override"
    echo "             PORT set in .env file. Defaults to 3002."
    echo "    --host:  choose hostname of the node server. This will override"
    echo "             MONCOMPTEPRO_HOST set in .env file."
    echo "             Defaults to http://localhost:3002."
    echo "    Everything added after \`-- \` at the end is passed to the cypress command."
    echo "    Defaults to \`--headed\`. Removed if you pass any args."
    echo "${0##*/} prepare [--force] [--port=PORT] [--host=HOST] TEST_NAME"
    echo "  Prepare the server for a manual test."
    echo "  This has the exact same behavior of the run command but does not run cypress."
    echo "${0##*/} list"
    echo "  List existing tests."
    exit 0
    ;;
  list)
    echo "Available tests:"
    for test in "${available_tests[@]}"; do
      echo "  $test"
    done
    exit 0
    ;;
  run|prepare)
    action=$1
    shift
    ;;
esac

if [ -z "$action" ]; then
  echo_error "Unknown command. Use \`-h\` to see available commands."
  exit 1
fi

force=false
port=3002
host="http://localhost:3002"
# loop through all arguments, removing them as we go
cmd=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --force)
      force=true
      shift
      ;;
    --port=*)
      port="${1#*=}"
      shift
      ;;
    --host=*)
      host="${1#*=}"
      shift
      ;;
    *)
      cmd="$cmd $1"
      shift
      ;;
  esac
done


# check for cypress additional args and trim whitespaces
test_name=""
cypress_args=""
if [[ $cmd == *" -- "* ]]; then
  cypress_args=$(echo "${cmd#* -- }" | xargs)
  test_name=$(echo "${cmd% -- *}" | xargs)
else
  test_name=$(echo "$cmd" | xargs)
fi

if [[ ! " ${available_tests[@]} " =~ " ${test_name} " ]]; then
  echo_error "test $test_name not found. Use \`list\` command to see available test names."
  exit 1
fi

all_good=true
if [ ! -f "./cypress/fixtures/$test_name.sql" ]; then
  echo_error "no fixture file found: cypress/fixtures/$test_name.sql"
  echo "If no fixture is needed for this test, create an empty file and try again."
  all_good=false
fi

if [ ! -f "./cypress/env/$test_name.conf" ]; then
  echo_error "no env file found: cypress/env/$test_name.conf"
  echo "If no env is needed for this test, create an empty file and try again."
  all_good=false
fi

# check for specific env vars required for tests that you don't necessary have set when doing local dev
secrets_env_vars=(BREVO_API_KEY ZAMMAD_URL ZAMMAD_TOKEN CYPRESS_MAILSLURP_API_KEY)
for var in "${secrets_env_vars[@]}"; do
  found=$(grep "$var" .env)
  if [ -z "$found" ]; then
    echo_error "required test env var $var not found in .env file. Add it and try again."
    all_good=false
  fi
done

if [ "$all_good" = false ]; then
  exit 1
fi

#  ask user to confirm because this is a destructive operation
if [ "$force" = false ]; then
  read -r -p "Running this will empty your local database. Continue? [y/N] "
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Exiting"
    exit 0
  fi
fi

pid_docker=false
if [ -z "$(docker compose ps -q)" ]; then
  echo_important "Starting docker project…"
  docker compose up -d &
  pid_docker=$!
  sleep 5
fi

echo_important "Emptying database and applying fixtures…"
ENABLE_DATABASE_DELETION=True npx run-s delete-database "fixtures:load-ci cypress/fixtures/$test_name.sql" "update-organization-info 2000"

echo_important "Starting local server with testing env…"
env $(grep -v '^#' cypress/env/join_with_sponsorship.conf | xargs) DO_NOT_SEND_MAIL=False DO_NOT_RATE_LIMIT=True MONCOMPTEPRO_HOST=$host PORT=$port npm run dev &
pid_server=$!

if [ "$action" = "run" ]; then
  sleep 3
  echo_important "Starting cypress…"
  mailslurp_api_key=$(grep CYPRESS_MAILSLURP_API_KEY .env | cut -d'=' -f2)
  CYPRESS_MAILSLURP_API_KEY=$mailslurp_api_key CYPRESS_MONCOMPTEPRO_HOST=$host cypress run $cypress_args --spec "cypress/e2e/$test_name.cy.js"
  pid_cypress=$!

  # https://stackoverflow.com/a/41762802/257559
  if [ "$pid_docker" != false ]; then
    wait $pid_docker $pid_server $pid_cypress
  else
    wait $pid_server $pid_cypress
  fi
else
  if [ "$pid_docker" != false ]; then
    wait $pid_docker $pid_server
  else
    wait $pid_server
  fi
fi

